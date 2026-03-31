export type ControllablePromise<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
  status: "pending" | "resolved" | "rejected";
};

export const controllablePromise = <T>(): ControllablePromise<T> => {
  let status: ControllablePromise<T>["status"] = "pending";
  let promiseResolve: (value: T) => void = () => {
    throw new Error("Illegal state: Promise not created");
  };
  let promiseReject: (reason?: unknown) => void = () => {
    throw new Error("Illegal state: Promise not created");
  };
  let isInitialized = false;

  const promise = new Promise<T>((resolve, reject) => {
    promiseResolve = (value) => {
      status = "resolved";
      resolve(value);
    };
    promiseReject = (reason) => {
      status = "rejected";
      reject(reason);
    };
    isInitialized = true;
  });

  if (!isInitialized) {
    throw new Error("Illegal state: Promise not created");
  }

  return {
    promise,
    resolve: promiseResolve,
    reject: promiseReject,
    get status() {
      return status;
    },
    set status(nextStatus) {
      status = nextStatus;
    },
  };
};
