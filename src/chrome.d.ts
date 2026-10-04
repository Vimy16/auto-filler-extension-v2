declare const chrome: {
  storage: {
    sync: {
      get: (key: string) => Promise<Record<string, any>>;
      set: (value: Record<string, any>) => Promise<void>;
    };
    local: {
      get: (key: string) => Promise<Record<string, any>>;
      set: (value: Record<string, any>) => Promise<void>;
    };
  };
  tabs: {
    query: (queryInfo: { active: boolean; currentWindow: boolean }) => Promise<Array<{ id?: number }>>;
    sendMessage: (tabId: number, message: unknown) => Promise<unknown>;
  };
};
