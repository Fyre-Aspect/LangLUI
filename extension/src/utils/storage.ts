export const storageGet = <T>(key: string): Promise<T | null> =>
  new Promise((resolve) =>
    chrome.storage.local.get([key], (result) =>
      resolve(result[key] ?? null)
    )
  );

export const storageSet = (key: string, value: unknown): Promise<void> =>
  new Promise((resolve) =>
    chrome.storage.local.set({ [key]: value }, resolve)
  );

export const storageClear = (key: string): Promise<void> =>
  new Promise((resolve) =>
    chrome.storage.local.remove([key], resolve)
  );
