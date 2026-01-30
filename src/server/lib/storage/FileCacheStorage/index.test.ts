import { Effect, Layer, Ref } from "effect";
import { z } from "zod";
import { testFileSystemLayer } from "../../../../testing/layers/testFileSystemLayer";
import { testPersistentServiceLayer } from "../../../../testing/layers/testPersistentServiceLayer";
import { FileCacheStorage, makeFileCacheStorageLayer } from "./index";

// Schema for testing
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof UserSchema>;

describe("FileCacheStorage", () => {
  describe("basic operations", () => {
    it("can save and retrieve data with set and get", async () => {
      const program = Effect.gen(function* () {
        const cache = yield* FileCacheStorage<User>();

        // Save data
        yield* cache.set("user-1", {
          id: "user-1",
          name: "Alice",
          email: "alice@example.com",
        });

        // Retrieve data
        const user = yield* cache.get("user-1");
        return user;
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(
            makeFileCacheStorageLayer("test-users", UserSchema).pipe(
              Layer.provide(testPersistentServiceLayer()),
              Layer.provide(testFileSystemLayer()),
            ),
          ),
        ),
      );

      expect(result).toEqual({
        id: "user-1",
        name: "Alice",
        email: "alice@example.com",
      });
    });

    it("returns undefined when retrieving non-existent key", async () => {
      const program = Effect.gen(function* () {
        const cache = yield* FileCacheStorage<User>();
        return yield* cache.get("non-existent");
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(
            makeFileCacheStorageLayer("test-users", UserSchema).pipe(
              Layer.provide(testPersistentServiceLayer()),
              Layer.provide(testFileSystemLayer()),
            ),
          ),
        ),
      );

      expect(result).toBeUndefined();
    });

    it("can delete data with invalidate", async () => {
      const program = Effect.gen(function* () {
        const cache = yield* FileCacheStorage<User>();

        // Save data
        yield* cache.set("user-1", {
          id: "user-1",
          name: "Alice",
          email: "alice@example.com",
        });

        // Delete data
        yield* cache.invalidate("user-1");

        // Returns undefined after deletion
        return yield* cache.get("user-1");
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(
            makeFileCacheStorageLayer("test-users", UserSchema).pipe(
              Layer.provide(testPersistentServiceLayer()),
              Layer.provide(testFileSystemLayer()),
            ),
          ),
        ),
      );

      expect(result).toBeUndefined();
    });

    it("Can retrieve all data with getAll", async () => {
      const program = Effect.gen(function* () {
        const cache = yield* FileCacheStorage<User>();

        // Save multiple entries
        yield* cache.set("user-1", {
          id: "user-1",
          name: "Alice",
          email: "alice@example.com",
        });
        yield* cache.set("user-2", {
          id: "user-2",
          name: "Bob",
          email: "bob@example.com",
        });

        // Get all data
        return yield* cache.getAll();
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(
            makeFileCacheStorageLayer("test-users", UserSchema).pipe(
              Layer.provide(testPersistentServiceLayer()),
              Layer.provide(testFileSystemLayer()),
            ),
          ),
        ),
      );

      expect(result.size).toBe(2);
      expect(result.get("user-1")).toEqual({
        id: "user-1",
        name: "Alice",
        email: "alice@example.com",
      });
      expect(result.get("user-2")).toEqual({
        id: "user-2",
        name: "Bob",
        email: "bob@example.com",
      });
    });
  });

  describe("Reading persisted data", () => {
    it("Reads persisted data on initialization", async () => {
      // Mock returning persisted data
      const program = Effect.gen(function* () {
        const cache = yield* FileCacheStorage<User>();
        return yield* cache.getAll();
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(
            makeFileCacheStorageLayer("test-users", UserSchema).pipe(
              Layer.provide(
                testPersistentServiceLayer({
                  savedEntries: [
                    [
                      "user-1",
                      {
                        id: "user-1",
                        name: "Alice",
                        email: "alice@example.com",
                      },
                    ],
                    [
                      "user-2",
                      {
                        id: "user-2",
                        name: "Bob",
                        email: "bob@example.com",
                      },
                    ],
                  ],
                }),
              ),
              Layer.provide(testFileSystemLayer()),
            ),
          ),
        ),
      );

      expect(result.size).toBe(2);
      expect(result.get("user-1")?.name).toBe("Alice");
      expect(result.get("user-2")?.name).toBe("Bob");
    });

    it("Data that fails validation is ignored", async () => {
      const program = Effect.gen(function* () {
        const cache = yield* FileCacheStorage<User>();
        return yield* cache.getAll();
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(
            makeFileCacheStorageLayer("test-users", UserSchema).pipe(
              Layer.provide(
                testPersistentServiceLayer({
                  savedEntries: [
                    [
                      "user-1",
                      {
                        id: "user-1",
                        name: "Alice",
                        email: "alice@example.com",
                      },
                    ],
                    [
                      "user-invalid",
                      {
                        id: "invalid",
                        name: "Invalid",
                        // Missing email (validation error)
                      },
                    ],
                    [
                      "user-2",
                      {
                        id: "user-2",
                        name: "Bob",
                        email: "invalid-email", // Invalid email address
                      },
                    ],
                  ],
                }),
              ),

              Layer.provide(testFileSystemLayer()),
            ),
          ),
        ),
      );

      // Only load valid data
      expect(result.size).toBe(1);
      expect(result.get("user-1")?.name).toBe("Alice");
      expect(result.get("user-invalid")).toBeUndefined();
      expect(result.get("user-2")).toBeUndefined();
    });
  });

  describe("Persistence synchronization", () => {
    it("Calls save when saving data with set", async () => {
      const saveCallsRef = await Effect.runPromise(Ref.make<number>(0));

      const program = Effect.gen(function* () {
        const cache = yield* FileCacheStorage<User>();

        yield* cache.set("user-1", {
          id: "user-1",
          name: "Alice",
          email: "alice@example.com",
        });

        // Wait for background execution
        yield* Effect.sleep("10 millis");
      });

      await Effect.runPromise(
        program.pipe(
          Effect.provide(
            makeFileCacheStorageLayer("test-users", UserSchema).pipe(
              Layer.provide(
                testPersistentServiceLayer({
                  save: () =>
                    Effect.gen(function* () {
                      yield* Ref.update(saveCallsRef, (n) => n + 1);
                    }),
                }),
              ),
              Layer.provide(testFileSystemLayer()),
            ),
          ),
        ),
      );

      const saveCalls = await Effect.runPromise(Ref.get(saveCallsRef));
      expect(saveCalls).toBeGreaterThan(0);
    });

    it("Does not call save when setting the same value (diff detection)", async () => {
      const saveCallsRef = await Effect.runPromise(Ref.make<number>(0));

      const program = Effect.gen(function* () {
        const cache = yield* FileCacheStorage<User>();

        // Set the same existing value
        yield* cache.set("user-1", {
          id: "user-1",
          name: "Alice",
          email: "alice@example.com",
        });

        // Wait for background execution
        yield* Effect.sleep("10 millis");
      });

      await Effect.runPromise(
        program.pipe(
          Effect.provide(
            makeFileCacheStorageLayer("test-users", UserSchema).pipe(
              Layer.provide(
                testPersistentServiceLayer({
                  savedEntries: [
                    [
                      "user-1",
                      {
                        id: "user-1",
                        name: "Alice",
                        email: "alice@example.com",
                      },
                    ],
                  ],
                  save: () =>
                    Effect.gen(function* () {
                      yield* Ref.update(saveCallsRef, (n) => n + 1);
                    }),
                }),
              ),
              Layer.provide(testFileSystemLayer()),
            ),
          ),
        ),
      );

      const saveCalls = await Effect.runPromise(Ref.get(saveCallsRef));
      // No diff, so save is not called
      expect(saveCalls).toBe(0);
    });

    it("Calls save when deleting data with invalidate", async () => {
      const saveCallsRef = await Effect.runPromise(Ref.make<number>(0));

      const program = Effect.gen(function* () {
        const cache = yield* FileCacheStorage<User>();

        yield* cache.invalidate("user-1");

        // Wait for background execution
        yield* Effect.sleep("10 millis");
      });

      await Effect.runPromise(
        program.pipe(
          Effect.provide(
            makeFileCacheStorageLayer("test-users", UserSchema).pipe(
              Layer.provide(
                testPersistentServiceLayer({
                  savedEntries: [
                    [
                      "user-1",
                      {
                        id: "user-1",
                        name: "Alice",
                        email: "alice@example.com",
                      },
                    ],
                  ],
                  save: () =>
                    Effect.gen(function* () {
                      yield* Ref.update(saveCallsRef, (n) => n + 1);
                    }),
                }),
              ),
              Layer.provide(testFileSystemLayer()),
            ),
          ),
        ),
      );

      const saveCalls = await Effect.runPromise(Ref.get(saveCallsRef));
      expect(saveCalls).toBeGreaterThan(0);
    });

    it("Calling invalidate on a non-existent key does not trigger save", async () => {
      const saveCallsRef = await Effect.runPromise(Ref.make<number>(0));

      const program = Effect.gen(function* () {
        const cache = yield* FileCacheStorage<User>();

        // Call invalidate on a non-existent key
        yield* cache.invalidate("non-existent");

        // Wait for background execution
        yield* Effect.sleep("10 millis");
      });

      await Effect.runPromise(
        program.pipe(
          Effect.provide(
            makeFileCacheStorageLayer("test-users", UserSchema).pipe(
              Layer.provide(
                testPersistentServiceLayer({
                  save: () =>
                    Effect.gen(function* () {
                      yield* Ref.update(saveCallsRef, (n) => n + 1);
                    }),
                }),
              ),
              Layer.provide(testFileSystemLayer()),
            ),
          ),
        ),
      );

      const saveCalls = await Effect.runPromise(Ref.get(saveCallsRef));
      // Key does not exist, so save is not called
      expect(saveCalls).toBe(0);
    });
  });

  describe("Complex scenarios", () => {
    it("Can execute multiple operations in sequence", async () => {
      const program = Effect.gen(function* () {
        const cache = yield* FileCacheStorage<User>();

        // Verify initial data
        const initial = yield* cache.getAll();
        expect(initial.size).toBe(1);

        // Add new user
        yield* cache.set("user-2", {
          id: "user-2",
          name: "Bob",
          email: "bob@example.com",
        });

        // Update existing user
        yield* cache.set("user-1", {
          id: "user-1",
          name: "Alice Updated",
          email: "alice.updated@example.com",
        });

        // Get all data
        const afterUpdate = yield* cache.getAll();
        expect(afterUpdate.size).toBe(2);
        expect(afterUpdate.get("user-1")?.name).toBe("Alice Updated");
        expect(afterUpdate.get("user-2")?.name).toBe("Bob");

        // Delete user
        yield* cache.invalidate("user-1");

        // Verify state after deletion
        const afterDelete = yield* cache.getAll();
        expect(afterDelete.size).toBe(1);
        expect(afterDelete.get("user-1")).toBeUndefined();
        expect(afterDelete.get("user-2")?.name).toBe("Bob");
      });

      await Effect.runPromise(
        program.pipe(
          Effect.provide(
            makeFileCacheStorageLayer("test-users", UserSchema).pipe(
              Layer.provide(
                testPersistentServiceLayer({
                  savedEntries: [
                    [
                      "user-1",
                      {
                        id: "user-1",
                        name: "Alice",
                        email: "alice@example.com",
                      },
                    ],
                  ],
                }),
              ),
              Layer.provide(testFileSystemLayer()),
            ),
          ),
        ),
      );
    });
  });
});
