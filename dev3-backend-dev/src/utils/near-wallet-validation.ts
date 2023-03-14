import { nearWalletRegex } from './regex';

export function isNearWallet(wallet: string) {
  return nearWalletRegex.test(wallet);
}
