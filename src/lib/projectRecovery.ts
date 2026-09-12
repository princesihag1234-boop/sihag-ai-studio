const DATABASE_NAME =
  "sihag-ai-studio";

const DATABASE_VERSION =
  1;

const STORE_NAME =
  "project-recovery";

const LATEST_KEY =
  "latest";

export type RecoveryRecord<T> = {
  id: typeof LATEST_KEY;
  schemaVersion: 1;
  savedAt: string;
  revision: number;
  sessionId: string | null;
  project: T;
};

type SaveRecoveryOptions = {
  revision?: number;
  sessionId?: string | null;
};

function isRecordLike(
  value: unknown
): value is Record<string, unknown> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function normalizeRevision(
  value: unknown
) {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
      ? Math.max(
          0,
          Math.floor(value)
        )
      : 0
  );
}

function normalizeSessionId(
  value: unknown
) {
  return (
    typeof value === "string" &&
    value.trim()
      ? value.trim().slice(
          0,
          160
        )
      : null
  );
}

function normalizeSavedAt(
  value: unknown
) {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const time =
    Date.parse(value);

  return Number.isFinite(time)
    ? new Date(time).toISOString()
    : null;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise(
    (resolve, reject) => {
      if (
        typeof indexedDB ===
        "undefined"
      ) {
        reject(
          new Error(
            "Recovery storage is not available in this browser."
          )
        );
        return;
      }

      const request =
        indexedDB.open(
          DATABASE_NAME,
          DATABASE_VERSION
        );

      request.onupgradeneeded =
        () => {
          const database =
            request.result;

          if (
            !database.objectStoreNames.contains(
              STORE_NAME
            )
          ) {
            database.createObjectStore(
              STORE_NAME,
              {
                keyPath: "id",
              }
            );
          }
        };

      request.onsuccess =
        () => {
          const database =
            request.result;

          database.onversionchange =
            () => {
              database.close();
            };

          resolve(database);
        };

      request.onerror =
        () =>
          reject(
            request.error ??
              new Error(
                "Could not open recovery database."
              )
          );

      request.onblocked =
        () =>
          reject(
            new Error(
              "Recovery storage is temporarily blocked by another SIHAG AI STUDIO tab."
            )
          );
    }
  );
}

function closeDatabase(
  database: IDBDatabase
) {
  try {
    database.close();
  } catch {
    // Closing an already-closed IndexedDB connection is harmless.
  }
}

export async function saveRecoveryProject<T>(
  project: T,
  options: SaveRecoveryOptions = {}
): Promise<RecoveryRecord<T>> {
  const database =
    await openDatabase();

  const record: RecoveryRecord<T> = {
    id: LATEST_KEY,
    schemaVersion: 1,
    savedAt:
      new Date().toISOString(),
    revision:
      normalizeRevision(
        options.revision
      ),
    sessionId:
      normalizeSessionId(
        options.sessionId
      ),
    project,
  };

  try {
    await new Promise<void>(
      (resolve, reject) => {
        const transaction =
          database.transaction(
            STORE_NAME,
            "readwrite"
          );

        const store =
          transaction.objectStore(
            STORE_NAME
          );

        store.put(record);

        transaction.oncomplete =
          () => resolve();

        transaction.onerror =
          () =>
            reject(
              transaction.error ??
                new Error(
                  "Autosave failed."
                )
            );

        transaction.onabort =
          () =>
            reject(
              transaction.error ??
                new Error(
                  "Autosave was aborted."
                )
            );
      }
    );

    return record;
  } finally {
    closeDatabase(database);
  }
}

export async function loadRecoveryProject<T>():
  Promise<RecoveryRecord<T> | null> {
  const database =
    await openDatabase();

  try {
    const raw =
      await new Promise<unknown>(
        (resolve, reject) => {
          const transaction =
            database.transaction(
              STORE_NAME,
              "readonly"
            );

          const store =
            transaction.objectStore(
              STORE_NAME
            );

          const request =
            store.get(
              LATEST_KEY
            );

          request.onsuccess =
            () =>
              resolve(
                request.result
              );

          request.onerror =
            () =>
              reject(
                request.error ??
                  new Error(
                    "Could not read recovery data."
                  )
              );

          transaction.onabort =
            () =>
              reject(
                transaction.error ??
                  new Error(
                    "Recovery read was aborted."
                  )
              );
        }
      );

    if (!isRecordLike(raw)) {
      return null;
    }

    const savedAt =
      normalizeSavedAt(
        raw.savedAt
      );

    if (
      raw.id !== LATEST_KEY ||
      !savedAt ||
      !("project" in raw)
    ) {
      return null;
    }

    return {
      id: LATEST_KEY,
      schemaVersion:
        raw.schemaVersion === 1
          ? 1
          : 1,
      savedAt,
      revision:
        normalizeRevision(
          raw.revision
        ),
      sessionId:
        normalizeSessionId(
          raw.sessionId
        ),
      project:
        raw.project as T,
    };
  } finally {
    closeDatabase(database);
  }
}

export async function clearRecoveryProject() {
  const database =
    await openDatabase();

  try {
    await new Promise<void>(
      (resolve, reject) => {
        const transaction =
          database.transaction(
            STORE_NAME,
            "readwrite"
          );

        const store =
          transaction.objectStore(
            STORE_NAME
          );

        store.delete(
          LATEST_KEY
        );

        transaction.oncomplete =
          () => resolve();

        transaction.onerror =
          () =>
            reject(
              transaction.error ??
                new Error(
                  "Could not clear recovery data."
                )
            );

        transaction.onabort =
          () =>
            reject(
              transaction.error ??
                new Error(
                  "Recovery cleanup was aborted."
                )
            );
      }
    );
  } finally {
    closeDatabase(database);
  }
}
