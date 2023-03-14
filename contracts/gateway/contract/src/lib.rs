/*
 * Payment contract
 *
 *
 */

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::serde_json::json;
use near_sdk::{
    assert_self, env, is_promise_success, log, near_bindgen, AccountId, Balance, Gas, Promise,
    PromiseError, PublicKey,
};

pub mod events;
pub use crate::events::{EventLog, EventLogVariant, PaymentRequestLog};

pub mod external;
pub use crate::external::*;

/// This spec can be treated like a version of the standard.
pub const DEV3_METADATA_SPEC: &str = "1.0.0";
/// This is the name of the NFT standard we're using
pub const DEV3_STANDARD_NAME: &str = "dev3";

const TGAS: u64 = 1_000_000_000_000;
const MIN_GAS_FOR_FT_TRANSFER: Gas = Gas(5_000_000_000_000); // 5 TGas
const MIN_GAS_FOR_STORAGE_DEPOSIT: Gas = Gas(5_000_000_000_000); // 5 TGas

const NEAR_PER_STORAGE: Balance = 10_000_000_000_000_000_000; // 10e18yⓃ

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct PaymentMetadata {
    pub id: String,
    pub amount: U128,
    pub receiver_account_id: AccountId,
    pub ft_token_account_id: Option<AccountId>,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct AmpnetGateway {
    code: UnorderedMap<AccountId, Vec<u8>>,
}

impl Default for AmpnetGateway {
    fn default() -> Self {
        Self {
            code: UnorderedMap::new(b"code".to_vec()),
        }
    }
}

#[near_bindgen]
impl AmpnetGateway {
    #[payable]
    pub fn clean(&mut self) {
        assert!(
            env::predecessor_account_id() == env::current_account_id(),
            "Only the contract owner can clean the contract",
        );

        self.code.clear();
        env::storage_remove(&b"code".to_vec());
    }

    pub fn get_contracts(&self) -> Vec<AccountId> {
        self.code.keys().collect()
    }

    pub fn get_contract_code(&self, contract_id: AccountId) -> Option<Vec<u8>> {
        self.code.get(&contract_id)
    }

    #[payable]
    pub fn remove_contract_code(&mut self, contract_id: AccountId) {
        assert!(
            env::predecessor_account_id()
                .to_string()
                .contains("dev3_contracts.testnet"),
            "Only the dev3_contracts.testnet account and subaccounts can remove the stored contract",
        );

        self.code.remove(&contract_id);
    }

    pub fn get_contract_deployment_price(&self, contract_id: AccountId) -> Option<String> {
        self.code.get(&contract_id).map(|code| {
            let near = (NEAR_PER_STORAGE * (code.len() as u128)) + 90000000000000000000000;
            format!("{}", near)
        })
    }

    #[payable]
    pub fn update_stored_contract(&mut self) {
        if !env::predecessor_account_id()
            .to_string()
            .contains(".dev3_contracts.testnet")
        {
            env::panic_str(
                "Only the dev3_contracts.testnet subaccounts can update the stored contract",
            );
        }

        self.code.insert(
            &env::predecessor_account_id(),
            &env::input().expect("Error: No input").to_vec(),
        );
    }

    #[payable]
    pub fn create_factory_subaccount_and_deploy(
        &mut self,
        contract_id: AccountId,
        name: String,
        public_key: Option<PublicKey>,
    ) -> Promise {
        // Assert the sub-account is valid
        let current_account = env::current_account_id().to_string();
        let subaccount: AccountId = format!("{name}.{current_account}").parse().unwrap();
        assert!(
            env::is_valid_account_id(subaccount.as_bytes()),
            "Invalid subaccount"
        );

        let contract_code = self.code.get(&contract_id).expect("Error: No code stored");

        // Assert enough money is attached to create the account and deploy the contract
        let attached = env::attached_deposit();

        let contract_bytes = contract_code.len() as u128;
        let minimum_needed = NEAR_PER_STORAGE * contract_bytes;
        assert!(
            attached >= minimum_needed,
            "Attach at least {minimum_needed} yⓃ"
        );

        let mut promise = Promise::new(subaccount.clone())
            .create_account()
            .transfer(attached)
            .deploy_contract(contract_code);

        // Add full access key is the user passes one
        if let Some(pk) = public_key {
            promise = promise.add_full_access_key(pk);
        }

        // Add callback
        promise.then(
            Self::ext(env::current_account_id()).create_factory_subaccount_and_deploy_callback(
                subaccount,
                env::predecessor_account_id(),
                attached,
            ),
        )
    }

    #[private]
    pub fn create_factory_subaccount_and_deploy_callback(
        &mut self,
        account: AccountId,
        user: AccountId,
        attached: Balance,
        #[callback_result] create_deploy_result: Result<(), PromiseError>,
    ) -> bool {
        if let Ok(_result) = create_deploy_result {
            log!(format!("Correctly created and deployed to {account}"));
            return true;
        };

        log!(format!(
            "Error creating {account}, returning {attached}yⓃ to {user}"
        ));
        Promise::new(user).transfer(attached);
        false
    }

    #[payable]
    pub fn transfer_funds(&mut self, request: PaymentMetadata) -> Promise {
        env::log_str(&format!(
            "Transferring funds for request ID: {}",
            request.id
        ));

        assert!(
            request.ft_token_account_id.is_some() || env::attached_deposit() == request.amount.0,
            "Not enough attached deposit"
        );

        if let Some(ft_token_contract) = request.clone().ft_token_account_id {
            return Promise::new(ft_token_contract)
                        .function_call("storage_deposit".to_string(), json!({ "account_id": request.receiver_account_id }).to_string().into_bytes(), 1250000000000000000000, MIN_GAS_FOR_STORAGE_DEPOSIT)
                        .function_call("ft_transfer_call".to_string(), json!({ "receiver_id": request.receiver_account_id, "amount": request.amount, "msg": request.id }).to_string().into_bytes(), 1, MIN_GAS_FOR_FT_TRANSFER)
                        .then(
                            Self::ext(env::current_account_id())
                                .with_static_gas(Gas(5 * TGAS))
                                .on_transfer_for_request(request.clone(), env::predecessor_account_id())
                        );
        } else {
            // if no token type is specified, we transfer NEAR
            return Promise::new(request.receiver_account_id.clone())
                .transfer(request.amount.0)
                .then(
                    Self::ext(env::current_account_id())
                        .with_static_gas(Gas(5 * TGAS))
                        .on_transfer_for_request(request.clone(), env::predecessor_account_id()),
                );
        };
    }

    #[private]
    pub fn on_transfer_for_request(
        &mut self,
        request: PaymentMetadata,
        predecessor_account_id: AccountId,
    ) -> bool {
        assert_self();

        if is_promise_success() {
            env::log_str(&format!(
                "Transferring {} yNEAR from {} to account {}",
                request.amount.0, predecessor_account_id, request.receiver_account_id
            ));

            let log: EventLog = EventLog {
                standard: DEV3_STANDARD_NAME.to_string(),
                version: DEV3_METADATA_SPEC.to_string(),
                event: EventLogVariant::PaymentRequestTransferSuccess(PaymentRequestLog {
                    id: request.id.clone(),
                    memo: Some(request.id.clone()),
                    amount: request.amount,
                    sender_account_id: predecessor_account_id.clone(),
                    receiver_account_id: request.receiver_account_id.clone(),
                    ft_token_account_id: request.ft_token_account_id.clone(),
                }),
            };

            // Log the serialized json.
            env::log_str(&log.to_string());
            true
        } else {
            env::log_str(&format!(
                "Failed to transfer to account {}. Returning attached deposit of {} to {}",
                request.receiver_account_id, request.amount.0, predecessor_account_id
            ));

            Promise::new(predecessor_account_id.clone()).transfer(request.amount.0);

            let log: EventLog = EventLog {
                standard: DEV3_STANDARD_NAME.to_string(),
                version: DEV3_METADATA_SPEC.to_string(),
                event: EventLogVariant::PaymentRequestTransferFailed(PaymentRequestLog {
                    id: request.id.clone(),
                    memo: Some(request.id.clone()),
                    amount: request.amount,
                    sender_account_id: predecessor_account_id.clone(),
                    receiver_account_id: request.receiver_account_id.clone(),
                    ft_token_account_id: request.ft_token_account_id.clone(),
                }),
            };

            // Log the serialized json.
            env::log_str(&log.to_string());
            false
        }
    }

    //refund the initial deposit based on the amount of storage that was used up
    #[private]
    pub fn refund_deposit(&mut self, storage_used: u64) {
        //get how much it would cost to store the information
        let required_cost = env::storage_byte_cost() * Balance::from(storage_used);
        //get the attached deposit
        let attached_deposit = env::attached_deposit();

        //make sure that the attached deposit is greater than or equal to the required cost
        assert!(
            required_cost <= attached_deposit,
            "Must attach {} yoctoNEAR to cover storage",
            required_cost,
        );

        //get the refund amount from the attached deposit - required cost
        let refund = attached_deposit - required_cost;

        //if the refund is greater than 1 yocto NEAR, we refund the predecessor that amount
        if refund > 1 {
            Promise::new(env::predecessor_account_id()).transfer(refund);
        }
    }
}
