use near_sdk::ext_contract;

use crate::*;

#[ext_contract(this_contract)]
trait Callbacks {
    fn on_transfer_for_request(
        &mut self,
        account_id: near_sdk::AccountId,
        amount_sent: near_sdk::json_types::U128,
        predecessor_account_id: near_sdk::AccountId,
    ) -> bool;
}

/// FT contract
#[ext_contract(ext_ft_contract)]
trait ExtFTContract {
    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>);
}
