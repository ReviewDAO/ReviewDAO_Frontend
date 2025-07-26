// Ethereum provider type declarations
interface EthereumRequestArguments {
  method: string;
  params?: unknown[];
}

type EthereumEventHandler = (...args: unknown[]) => void;

interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: EthereumRequestArguments) => Promise<unknown>;
  on: (event: string, handler: EthereumEventHandler) => void;
  removeListener: (event: string, handler: EthereumEventHandler) => void;
  selectedAddress?: string;
  chainId?: string;
  enable?: () => Promise<void>;
}

export interface NetworkSwitchError {
  code: number;
  message: string;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    keplr?: {
      enable: (chainId: string) => Promise<void>;
      getKey: (chainId: string) => Promise<{
        name: string;
        algo: string;
        pubKey: Uint8Array;
        address: Uint8Array;
        bech32Address: string;
      }>;
      getOfflineSigner: (chainId: string) => {
        getAccounts: () => Promise<Array<{
          address: string;
          algo: string;
          pubkey: Uint8Array;
        }>>;
        signDirect: (signerAddress: string, signDoc: unknown) => Promise<unknown>;
      };
      ethereum?: EthereumProvider;
    };
  }
}

export {};