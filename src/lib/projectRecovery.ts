const DATABASE_NAME =
  "sihag-ai-studio";

const DATABASE_VERSION =
  1;

const STORE_NAME =
  "project-recovery";

const LATEST_KEY =
  "latest";

type RecoveryRecord<T> = {
  id: string;
  savedAt: string;
  project: T;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise(
    (resolve, reject) => {
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
        () =>
          resolve(
            request.result
          );

      request.onerror =
        () =>
          reject(
            request.error ??
              new Error(
                "Could not open recovery database."
              )
          );
    }
  );
}

export async function saveRecoveryProject<T>(
  project: T
) {
  const database =
    await openDatabase();

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

      const record: RecoveryRecord<T> = {
        id:
          LATEST_KEY,

        savedAt:
          new Date().toISOString(),

        project,
      };

      store.put(
        record
      );

      transaction.oncomplete =
        () =>
          resolve();

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

  database.close();
}

export async function loadRecoveryProject<T>():
  Promise<RecoveryRecord<T> | null> {
  const database =
    await openDatabase();

  const result =
    await new Promise<
      RecoveryRecord<T> | null
    >(
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
              (
                request.result as
                  | RecoveryRecord<T>
                  | undefined
              ) ??
                null
            );

        request.onerror =
          () =>
            reject(
              request.error ??
                new Error(
                  "Could not read recovery data."
                )
            );
      }
    );

  database.close();

  return result;
}

export async function clearRecoveryProject() {
  const database =
    await openDatabase();

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
        () =>
          resolve();

      transaction.onerror =
        () =>
          reject(
            transaction.error ??
              new Error(
                "Could not clear recovery data."
              )
          );
    }
  );

  database.close();
}
