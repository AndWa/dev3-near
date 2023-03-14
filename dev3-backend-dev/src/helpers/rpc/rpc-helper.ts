import { rpcMainnet, rpcTestnet } from './rpc-constants';
import { providers } from 'near-api-js';

export const getRpc = (NODE_ENV: string): string => {
  if (NODE_ENV === 'dev' || NODE_ENV === 'staging') {
    return rpcTestnet;
  }

  return rpcMainnet;
};

export const getState = async (
  txHash: string,
  caller_address: string,
  NODE_ENV: string,
): Promise<any> => {
  return await new providers.JsonRpcProvider({
    url: getRpc(NODE_ENV),
  }).txStatus(txHash, caller_address);
};
