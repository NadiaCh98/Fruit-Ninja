import React from 'react';

export function createContext<StoresMap extends { [K: string]: object }>(
  stores: StoresMap
) {
  const StoreContext = React.createContext<StoresMap>(undefined!);

  const StoreProvider: React.FC = ({ children }) => (
    <StoreContext.Provider value={stores}>{children}</StoreContext.Provider>
  );

  function useStore<K extends keyof StoresMap>(key: K): StoresMap[K] {
    return React.useContext(StoreContext)[key];
  }
  return {
    StoreProvider,
    useStore,
  };
}
