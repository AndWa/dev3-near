#!/bin/sh
raen build --release 

alias="status_message_advanced"

echo ">> Creating subaccount for Dev3 contracts"

near create-account "${alias}.dev3_contracts.testnet" --masterAccount dev3_contracts.testnet --initialBalance 0.1

echo ">> Updating Dev3 contracts to support new contract"

BYTES=`cat ./target/res/${alias}.wasm | base64`

near call dev3_contracts.testnet update_stored_contract "${BYTES}" --base64 --accountId "${alias}.dev3_contracts.testnet" --gas 30000000000000

near delete "${alias}.dev3_contracts.testnet" dev3_contracts.testnet