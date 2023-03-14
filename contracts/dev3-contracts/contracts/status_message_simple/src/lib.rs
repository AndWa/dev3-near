//! This contract implements a simple status message for each account.
//!
//! The contract provides methods to [set_status] / [get_status].
use near_sdk::{
    borsh::{self, BorshDeserialize, BorshSerialize},
    collections::LookupMap,
    env, near_bindgen, AccountId,
};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct StatusMessage {
    records: LookupMap<AccountId, String>,
}

impl Default for StatusMessage {
    fn default() -> Self {
        Self {
            records: LookupMap::new(b"r"),
        }
    }
}

#[near_bindgen]
impl StatusMessage {
    /// Public method: Sets the status message for the caller's account.
    pub fn set_status(&mut self, message: String) {
        let account_id = env::signer_account_id();
        self.records.insert(&account_id, &message);
    }

    /// Public method: Returns the status message for the given account.
    pub fn get_status(&self, account_id: String) -> Option<String> {
        self.records.get(&account_id.parse().unwrap())
    }
}
