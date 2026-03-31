import { Command, Path } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { Context, Data, Effect, Either, Layer } from "effect";

export type AdaModelInfo = {
  index: number;
  label: string;
  isCurrent: boolean;
};

export type AdaModelUnsupportedReason = "CUSTOM_API_KEY_MODE";

export type AdaModelListResult = {
  models: AdaModelInfo[];
  currentIndex: number | null;
  currentLabel: string | null;
  switchSupported: boolean;
  unsupportedReason: AdaModelUnsupportedReason | null;
};

const ANSI_ESCAPE_REGEXP =
  // biome-ignore lint/suspicious/noControlCharactersInRegex: used for terminal output cleanup
  /\u001b\[[0-9;?]*[ -/]*[@-~]/g;
const ANSI_OSC_REGEXP =
  // biome-ignore lint/suspicious/noControlCharactersInRegex: used for terminal output cleanup
  /\u001b\][^\u0007]*(?:\u0007|\u001b\\)/g;

const toCleanText = (raw: string) =>
  raw
    .replace(ANSI_OSC_REGEXP, "")
    .replace(ANSI_ESCAPE_REGEXP, "")
    // Keep carriage-return updates as line breaks so menu lines are still parseable.
    .replace(/\r/g, "\n")
    .replaceAll("\u0008", "")
    .replaceAll("\u0000", "");

const normalizeLabel = (value: string) =>
  value.toLowerCase().replace(/\s+/g, " ").trim();

const extractCurrentModelFromHeader = (output: string): string | null => {
  const lines = output.split("\n").map((line) => line.trimEnd());
  const value = lines
    .flatMap((line) => {
      const zhMatch = line.match(/当前模型[:：]\s*(.+?)\s*$/);
      if (zhMatch?.[1]) {
        return [zhMatch[1].trim()];
      }
      const enMatch = line.match(/current model[:：]\s*(.+?)\s*$/i);
      if (enMatch?.[1]) {
        return [enMatch[1].trim()];
      }
      return [];
    })
    .at(-1);
  return value ?? null;
};

const isUnsupportedModeOutput = (output: string) =>
  /当前为自定义 API Key 模式，不支持切换模型|不支持切换模型|not support.*switch model|does not support.*switch model/i.test(
    output,
  );

const unsupportedModeListResult = (output: string): AdaModelListResult => ({
  models: [],
  currentIndex: null,
  currentLabel: extractCurrentModelFromHeader(output),
  switchSupported: false,
  unsupportedReason: "CUSTOM_API_KEY_MODE",
});

const resolveAdaExecutable = () =>
  Effect.gen(function* () {
    if (process.platform !== "win32") {
      return "ada";
    }

    const path = yield* Path.Path;

    const outputResult = yield* Effect.either(
      Command.string(
        Command.make("where", "ada").pipe(Command.runInShell(true)),
      ),
    ).pipe(Effect.provide(NodeContext.layer));

    if (Either.isRight(outputResult)) {
      const isAdaExecutableName = (value: string) => {
        const baseName = path.basename(value).toLowerCase();
        if (baseName.startsWith("claude")) {
          return false;
        }
        return baseName === "ada" || baseName.startsWith("ada.");
      };

      const candidates = outputResult.right
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const adaCandidates = candidates.filter(isAdaExecutableName);

      const byPriority = (value: string): number => {
        const lower = value.toLowerCase();
        if (lower.endsWith(".exe")) return 4;
        if (lower.endsWith(".cmd")) return 3;
        if (lower.endsWith(".ps1")) return 2;
        if (lower.endsWith(".bat")) return 1;
        return 0;
      };

      const sorted = adaCandidates.toSorted((a, b) => {
        const aPriority = byPriority(a);
        const bPriority = byPriority(b);
        if (aPriority < bPriority) return 1;
        if (aPriority > bPriority) return -1;
        return 0;
      });

      const best = sorted.at(0);
      if (best) {
        return best;
      }
    }

    return "ada.cmd";
  });

const formatUnknownError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

export const parseAdaModelOutput = (rawOutput: string): AdaModelListResult => {
  const output = toCleanText(rawOutput);
  const lines = output.split("\n").map((line) => line.trimEnd());
  const currentModelFromHeader = extractCurrentModelFromHeader(output);

  const parseModelLine = (line: string): AdaModelInfo | null => {
    const modelMatch =
      line.match(/^\s*(?:>\s*)?(\d+)\.\s*(.+?)\s*$/) ??
      line.match(/(?:^|\s)(\d+)\.\s+(.+?)\s*$/);
    if (!modelMatch?.[1] || !modelMatch[2]) {
      return null;
    }

    const index = Number.parseInt(modelMatch[1], 10);
    const rawLabel = modelMatch[2];
    const isCurrent = /\[当前\]|\[current\]/i.test(rawLabel);
    const label = rawLabel.replace(/\s*\[(?:当前|current)\]\s*/gi, "").trim();

    if (Number.isNaN(index) || label.length === 0) {
      return null;
    }

    return {
      index,
      label,
      isCurrent,
    };
  };

  let parsedModels = lines.flatMap((line) => {
    const model = parseModelLine(line);
    return model ? [model] : [];
  });

  if (parsedModels.length === 0) {
    // Fallback: some terminals emit menu items in a single wrapped line.
    const candidateChunks = output
      .split(/(?=\s(?:>\s*)?\d+\.\s)/g)
      .map((chunk) => chunk.trim())
      .filter((chunk) => /^\s*(?:>\s*)?\d+\.\s+/.test(chunk));
    parsedModels = candidateChunks.flatMap((chunk) => {
      const model = parseModelLine(chunk);
      return model ? [model] : [];
    });
  }

  const modelByIndex = new Map<number, AdaModelInfo>();
  for (const model of parsedModels) {
    modelByIndex.set(model.index, model);
  }
  const models = Array.from(modelByIndex.values()).sort(
    (left, right) => left.index - right.index,
  );

  let modelsWithCurrent = models;
  if (!models.some((model) => model.isCurrent) && currentModelFromHeader) {
    const normalizedHeader = normalizeLabel(currentModelFromHeader);
    const exact = models.find(
      (model) => normalizeLabel(model.label) === normalizedHeader,
    );
    const inParens = models.find((model) =>
      normalizeLabel(model.label).includes(`(${normalizedHeader})`),
    );
    const includes = models.find((model) =>
      normalizeLabel(model.label).includes(normalizedHeader),
    );
    const matched = exact ?? inParens ?? includes;
    if (matched) {
      modelsWithCurrent = models.map((model) => ({
        ...model,
        isCurrent: model.index === matched.index,
      }));
    }
  }

  const currentByMarker = modelsWithCurrent.find((model) => model.isCurrent);
  const currentIndex = currentByMarker?.index ?? null;
  const currentLabel = currentByMarker?.label ?? null;

  return {
    models: modelsWithCurrent,
    currentIndex,
    currentLabel,
    switchSupported: true,
    unsupportedReason: null,
  };
};

class AdaModelParseError extends Data.TaggedError("AdaModelParseError")<{
  message: string;
  output: string;
}> {}

class AdaModelCommandError extends Data.TaggedError("AdaModelCommandError")<{
  message: string;
  output: string;
}> {}

class AdaModelTimeoutError extends Data.TaggedError("AdaModelTimeoutError")<{
  message: string;
  output: string;
}> {}

class AdaModelTargetNotFoundError extends Data.TaggedError(
  "AdaModelTargetNotFoundError",
)<{
  targetIndex: number;
  output: string;
}> {}

class AdaModelCurrentUnknownError extends Data.TaggedError(
  "AdaModelCurrentUnknownError",
)<{
  message: string;
  output: string;
}> {}

class AdaModelUnsupportedModeError extends Data.TaggedError(
  "AdaModelUnsupportedModeError",
)<{
  message: string;
  output: string;
}> {}

type AdaInteractiveResult = {
  code: number;
  output: string;
};

type SpawnAdaModel = (options?: {
  onData?: (
    chunk: string,
    fullOutput: string,
    write: (input: string) => void,
  ) => void;
  timeoutMs?: number;
}) => Effect.Effect<
  AdaInteractiveResult,
  AdaModelTimeoutError | AdaModelCommandError
>;

const parseModelsOrFail = (output: string) =>
  Effect.gen(function* () {
    if (isUnsupportedModeOutput(toCleanText(output))) {
      return unsupportedModeListResult(toCleanText(output));
    }

    const parsed = parseAdaModelOutput(output);
    if (parsed.models.length === 0) {
      return yield* Effect.fail(
        new AdaModelParseError({
          message: "unable to parse model list from ada model output",
          output,
        }),
      );
    }
    return parsed;
  });

export const createAdaModelService = (spawnAdaModel: SpawnAdaModel) => {
  let currentLock = Promise.resolve();

  const runExclusive = <A>(task: () => Promise<A>) =>
    Effect.promise<A>(async () => {
      const previous = currentLock;
      let release: (() => void) | undefined;
      currentLock = new Promise<void>((resolve) => {
        release = resolve;
      });

      await previous;
      try {
        return await task();
      } finally {
        release?.();
      }
    });

  const listModelsInternal = () =>
    Effect.promise(async () => {
      const result = await Effect.runPromise(
        spawnAdaModel({
          timeoutMs: 12_000,
          onData: (_, fullOutput, write) => {
            const parsed = parseAdaModelOutput(fullOutput);
            if (parsed.models.length > 0) {
              // Exit interactive menu once list is visible.
              setTimeout(() => write("\u0003"), 120);
            }
          },
        }),
      );

      return await Effect.runPromise(parseModelsOrFail(result.output));
    });

  const listModels = () =>
    runExclusive(async () => await Effect.runPromise(listModelsInternal()));

  const switchModel = (targetIndex: number) =>
    runExclusive(async () => {
      const initial = await Effect.runPromise(listModelsInternal());
      if (!initial.switchSupported) {
        throw new AdaModelUnsupportedModeError({
          message: "ada model switch is not supported in current mode",
          output: JSON.stringify(initial),
        });
      }

      const result = await Effect.runPromise(
        spawnAdaModel({
          timeoutMs: 15_000,
          onData: (_, fullOutput, write) => {
            const parsed = parseAdaModelOutput(fullOutput);
            if (parsed.models.length === 0) {
              return;
            }

            const current =
              parsed.currentIndex === null
                ? undefined
                : parsed.models.find(
                    (model) => model.index === parsed.currentIndex,
                  );
            const target = parsed.models.find(
              (model) => model.index === targetIndex,
            );

            if (!target) {
              write("\u0003");
              return;
            }

            if (!current) {
              write("\u0003");
              return;
            }

            const diff = target.index - current.index;
            if (diff > 0) {
              write("\u001b[B".repeat(diff));
            } else if (diff < 0) {
              write("\u001b[A".repeat(Math.abs(diff)));
            }

            write("\r");
          },
        }),
      );

      const parsed = await Effect.runPromise(parseModelsOrFail(result.output));
      if (!parsed.switchSupported) {
        throw new AdaModelUnsupportedModeError({
          message: "ada model switch is not supported in current mode",
          output: result.output,
        });
      }
      const target = parsed.models.find((model) => model.index === targetIndex);
      if (!target) {
        throw new AdaModelTargetNotFoundError({
          targetIndex,
          output: result.output,
        });
      }

      const current = parsed.models.find((model) => model.isCurrent);
      if (!current) {
        throw new AdaModelCurrentUnknownError({
          message: "cannot determine current model before switching",
          output: result.output,
        });
      }

      const diff = target.index - current.index;
      // If nothing changed, still trigger Enter to confirm current option.
      if (diff === 0 && result.code !== 0) {
        throw new AdaModelCommandError({
          message: `ada model exited with code ${result.code}`,
          output: result.output,
        });
      }

      if (result.code !== 0) {
        throw new AdaModelCommandError({
          message: `ada model exited with code ${result.code}`,
          output: result.output,
        });
      }

      const latest = await Effect.runPromise(listModelsInternal());
      const switchedTo = latest.models.find((model) => model.isCurrent);
      if (!switchedTo) {
        throw new AdaModelCurrentUnknownError({
          message: "cannot determine current model after switching",
          output: result.output,
        });
      }

      return {
        switchedTo: {
          index: switchedTo.index,
          label: switchedTo.label,
        },
        ...latest,
      };
    });

  return {
    listModels,
    switchModel,
  };
};

const runAdaModelWithInput = (options: {
  input: string;
  timeoutMs: number;
  executable: string;
}) =>
  Effect.gen(function* () {
    const command = Command.make(options.executable, "model").pipe(
      Command.feed(options.input),
      Command.env({
        // biome-ignore lint/style/noProcessEnv: inherited env required by ada auth/runtime
        ...process.env,
        NO_COLOR: "1",
      }),
    );

    const output = yield* Command.string(command).pipe(
      Effect.timeoutFail({
        duration: options.timeoutMs,
        onTimeout: () =>
          new AdaModelTimeoutError({
            message: `ada model timed out after ${options.timeoutMs}ms`,
            output: "",
          }),
      }),
      Effect.mapError((error) => {
        if (error instanceof AdaModelTimeoutError) {
          return error;
        }
        return new AdaModelCommandError({
          message: "failed to execute ada model",
          output: formatUnknownError(error),
        });
      }),
      Effect.provide(NodeContext.layer),
    );

    return {
      code: 0,
      output,
    };
  });

const LiveLayerImpl = Effect.gen(function* () {
  const adaExecutable = yield* resolveAdaExecutable();
  const listCacheTtlMs = 10_000;
  let cachedList: { value: AdaModelListResult; at: number } | null = null;
  let currentLock = Promise.resolve();

  const runExclusive = <A>(task: () => Promise<A>) =>
    Effect.promise<A>(async () => {
      const previous = currentLock;
      let release: (() => void) | undefined;
      currentLock = new Promise<void>((resolve) => {
        release = resolve;
      });
      await previous;
      try {
        return await task();
      } finally {
        release?.();
      }
    });

  const listModelsInternal = () =>
    Effect.gen(function* () {
      const result = yield* runAdaModelWithInput({
        input: "\n",
        timeoutMs: 8_000,
        executable: adaExecutable,
      });
      if (result.code !== 0) {
        return yield* Effect.fail(
          new AdaModelCommandError({
            message: `ada model list failed with code ${result.code}`,
            output: result.output,
          }),
        );
      }
      return yield* parseModelsOrFail(result.output);
    });

  const readCachedList = () => {
    if (cachedList === null) {
      return null;
    }
    if (Date.now() - cachedList.at > listCacheTtlMs) {
      cachedList = null;
      return null;
    }
    return cachedList.value;
  };

  const writeCachedList = (value: AdaModelListResult) => {
    cachedList = {
      value,
      at: Date.now(),
    };
  };

  const listModels = () =>
    runExclusive(async () => {
      const cached = readCachedList();
      if (cached !== null) {
        return cached;
      }
      const latest = await Effect.runPromise(listModelsInternal());
      writeCachedList(latest);
      return latest;
    });

  const switchModel = (targetIndex: number) =>
    runExclusive(async () => {
      const initial =
        readCachedList() ?? (await Effect.runPromise(listModelsInternal()));
      if (!initial.switchSupported) {
        throw new AdaModelUnsupportedModeError({
          message: "ada model switch is not supported in current mode",
          output: JSON.stringify(initial),
        });
      }
      const target = initial.models.find(
        (model) => model.index === targetIndex,
      );
      const targetLabel = target?.label ?? null;
      if (!target) {
        throw new AdaModelTargetNotFoundError({
          targetIndex,
          output: JSON.stringify(initial),
        });
      }

      const isTargetSelected = (latest: AdaModelListResult) => {
        const current = latest.models.find((model) => model.isCurrent);
        if (!current) {
          return false;
        }
        if (targetLabel !== null) {
          return normalizeLabel(current.label) === normalizeLabel(targetLabel);
        }
        return current.index === targetIndex;
      };

      const readLatestWithRetry = async () => {
        let latest = await Effect.runPromise(listModelsInternal());
        // ada config persistence can be slightly delayed; retry briefly before failing.
        for (
          let attempt = 0;
          !isTargetSelected(latest) && attempt < 2;
          attempt++
        ) {
          await new Promise((resolve) => setTimeout(resolve, 120));
          latest = await Effect.runPromise(listModelsInternal());
        }
        return latest;
      };

      const switchResult = await Effect.runPromise(
        runAdaModelWithInput({
          input: `${targetIndex}\n`,
          timeoutMs: 10_000,
          executable: adaExecutable,
        }),
      );
      if (switchResult.code !== 0) {
        throw new AdaModelCommandError({
          message: `ada model switch failed with code ${switchResult.code}`,
          output: switchResult.output,
        });
      }
      if (/输入无效|invalid input/i.test(switchResult.output)) {
        throw new AdaModelCommandError({
          message: "ada model rejected target index input",
          output: switchResult.output,
        });
      }
      const latest = await readLatestWithRetry();

      writeCachedList(latest);
      const switchedTo = latest.models.find((model) => model.isCurrent);
      if (!switchedTo) {
        throw new AdaModelCurrentUnknownError({
          message: "cannot determine current model after switching",
          output: JSON.stringify(latest),
        });
      }
      const switchedByLabel =
        targetLabel !== null &&
        normalizeLabel(switchedTo.label) === normalizeLabel(targetLabel);
      if (!switchedByLabel && switchedTo.index !== targetIndex) {
        throw new AdaModelCommandError({
          message: `ada model switched to unexpected target: expected ${targetIndex}/${targetLabel ?? "unknown"}, got ${switchedTo.index}/${switchedTo.label}`,
          output: JSON.stringify(latest),
        });
      }

      return {
        switchedTo: {
          index: switchedTo.index,
          label: switchedTo.label,
        },
        ...latest,
      };
    });

  return {
    listModels,
    switchModel,
  };
});

export type IAdaModelService = Effect.Effect.Success<typeof LiveLayerImpl>;

export class AdaModelService extends Context.Tag("AdaModelService")<
  AdaModelService,
  IAdaModelService
>() {
  static Live = Layer.effect(this, LiveLayerImpl);
}
