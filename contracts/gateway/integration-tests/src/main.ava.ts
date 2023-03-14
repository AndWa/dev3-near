import anyTest, { TestFn } from "ava";
import { utils } from "near-api-js";
import { NEAR, NearAccount, Worker } from "near-workspaces";

const test = anyTest as TestFn<{
  worker: Worker;
  accounts: Record<string, NearAccount>;
}>;

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Deploy contract
  const root = worker.rootAccount;

  const john = await root.createSubAccount("john", {
    initialBalance: NEAR.parse("3 N").toJSON(),
  });

  const bob = await root.createSubAccount("bob", {
    initialBalance: NEAR.parse("3 N").toJSON(),
  });

  const sam = await root.createSubAccount("sam", {
    initialBalance: NEAR.parse("7 N").toJSON(),
  });

  const contract = await root.createSubAccount("ampnet");
  // Get wasm file path from package.json test script in folder above
  await contract.deploy(process.argv[2]);

  // Save state for test runs, it is unique for each test
  t.context.worker = worker;
  t.context.accounts = { root, contract, bob, john, sam };
});

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to stop the Sandbox:", error);
  });
});

test("create payment request", async (t) => {
  const { contract, john, bob } = t.context.accounts;

  const contractStartBalance = await contract.availableBalance();
  const johnStartBalance = await john.availableBalance();

  await john.call(
    contract,
    "add_payment_request",
    {
      amount: utils.format.parseNearAmount("1"),
      memo: "Test payment request",
      receiver_account_id: bob.accountId,
      timestamp: Math.round(new Date().getTime() / 1000),
    },
    {
      attachedDeposit: utils.format.parseNearAmount("0.01") as string, //"4460000000000000000000",
    }
  );

  const contractEndBalance = await contract.availableBalance();
  const johnEndBalance = await john.availableBalance();

  t.log("Contract start balance:", contractStartBalance.toHuman());
  t.log("Contract end balance:", contractEndBalance.toHuman());
  t.log(
    "Contract spent balance:",
    contractStartBalance.sub(contractEndBalance).toHuman()
  );

  t.log("John start balance:", johnStartBalance.toHuman());
  t.log("John end balance:", johnEndBalance.toHuman());
  t.log("John spent balance:", johnStartBalance.sub(johnEndBalance).toHuman());

  const request: any = await contract.view("payment_requests_for_id", {
    request_id: "1",
  });

  t.is(request.id, "1", "payment_request id should be 1");
  t.is(request.paid, false, "payment_request should not be paid");
});

test("pay payment request", async (t) => {
  const { contract, john, bob, sam } = t.context.accounts;

  const contractStartBalance = await contract.availableBalance();
  const bobStartBalance = await bob.availableBalance();
  const samStartBalance = await sam.availableBalance();

  await john.call(
    contract,
    "add_payment_request",
    {
      amount: utils.format.parseNearAmount("2"),
      memo: "Test payment request",
      receiver_account_id: bob.accountId,
      timestamp: Math.round(new Date().getTime() / 1000),
    },
    {
      attachedDeposit: utils.format.parseNearAmount("0.01") as string, //"4460000000000000000000",
    }
  );

  await sam.call(
    contract,
    "transfer_funds",
    {
      request_id: "1",
    },
    {
      attachedDeposit: utils.format.parseNearAmount("2") as string,
    }
  );

  const bobEndBalance = await bob.availableBalance();
  const samEndBalance = await sam.availableBalance();
  const contractEndBalance = await contract.availableBalance();

  t.log("Contract start balance:", contractStartBalance.toHuman());
  t.log("Contract end balance:", contractEndBalance.toHuman());
  t.log(
    "Contract spent balance:",
    contractStartBalance.sub(contractEndBalance).toHuman()
  );

  t.log("Sam start balance:", samStartBalance.toHuman());
  t.log("Sam end balance:", samEndBalance.toHuman());
  t.log("Sam spent balance:", samStartBalance.sub(samEndBalance).toHuman());

  t.log("Bob start balance:", bobStartBalance.toHuman());
  t.log("Bob end balance:", bobEndBalance.toHuman());
  t.log("Bob recieved balance:", bobEndBalance.sub(bobStartBalance).toHuman());

  const request: any = await contract.view("payment_requests_for_id", {
    request_id: "1",
  });

  t.is(request.id, "1", "payment_request id should be 1");
  t.is(request.paid, true, "payment_request should be paid");
});
