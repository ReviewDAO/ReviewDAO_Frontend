// Ethereum provider type declarations
interface EthereumRequestArguments {
  method: string;
  params?: unknown[];
}

type EthereumEventHandler = (...args: unknown[]) => void;

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: EthereumRequestArguments) => Promise<unknown>;
      on: (event: string, handler: EthereumEventHandler) => void;
      removeListener: (event: string, handler: EthereumEventHandler) => void;
      selectedAddress?: string;
      chainId?: string;
    };
  }
}

export {};