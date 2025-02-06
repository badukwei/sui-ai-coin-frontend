import { packageAddress } from "@/constants/move/claim";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

export async function mintWithEvent(
  coinType: string,
  treasuryCap: string,
  coinAddress: string,
  name: string,
  symbol: string,
  description: string,
  url: string,
  recipient: string,
  signAndExecuteTransaction: (args: {
    transaction: Transaction;
  }) => Promise<SuiTransactionBlockResponse>,
) {
  const tx = new Transaction();

  tx.moveCall({
		target: `${packageAddress}::claim::create`,
		// "0x0b55b80dbec5746a5bd08b810380fbea517488b8890160dc0d1c34a7ad3ddaf9::dankmeme::DANKMEME"
		typeArguments: [coinType],
		arguments: [
			// "0xce3d129b9a6e7e077aea8fa5a289e99c5acb141c994da65eab3d24d4b1bb4325"
			tx.object(treasuryCap),
			tx.pure.string(coinAddress),
			tx.pure.string(name),
			tx.pure.string(symbol),
			tx.pure.string(description),
			tx.pure.string(url),
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
