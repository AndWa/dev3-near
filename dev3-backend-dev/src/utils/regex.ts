export const nearWalletRegex = new RegExp(
  /^((\w|(?<!\.)\.)+(?<!\.)\.(testnet|near)|[A-Fa-f0-9]{64})$/,
);

export const emailRegex = new RegExp(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/);

export const deployedContractNameRegex = new RegExp(
  /^[A-Za-z_-]+[A-Za-z0-9_-]*$/,
);
