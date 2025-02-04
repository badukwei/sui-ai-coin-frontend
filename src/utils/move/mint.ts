import { SignedTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

export async function mintAndTransfer(
  coinType: string,
  treasuryCap: string,
  recipient: string,
  signAndExecuteTransaction: (args: {
    transaction: Transaction;
  }) => Promise<SignedTransaction>,
) {
  const tx = new Transaction();

  tx.moveCall({
    target: "0x2::coin::mint_and_transfer",
    // "0x0b55b80dbec5746a5bd08b810380fbea517488b8890160dc0d1c34a7ad3ddaf9::dankmeme::DANKMEME"
    typeArguments: [coinType],
    arguments: [
      // "0xce3d129b9a6e7e077aea8fa5a289e99c5acb141c994da65eab3d24d4b1bb4325"
      tx.object(treasuryCap),
      tx.pure.u64(1000000000),
      tx.pure.address(recipient),
    ],
  });

  tx.setGasBudget(200000000);

  const response = await signAndExecuteTransaction({
    transaction: tx,
  });

  console.log("Mint and transfer successful:", response);
  return response;
}
