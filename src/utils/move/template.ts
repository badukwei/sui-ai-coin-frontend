import { templateHex } from "@/constants/move/template";
import { bcs } from "@mysten/bcs";
import { update_constants, update_identifiers } from "@mysten/move-bytecode-template";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex, toBase64 } from "@mysten/sui/utils";
import type { SuiClient } from '@mysten/sui/client';
import { MetaData } from "@/types/ai/metadata";


const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY || "";

const updateTemplate = async (suiClient: SuiClient, params: MetaData) => {
	const signer = Ed25519Keypair.fromSecretKey(privateKey);
	const address = signer.toSuiAddress();
	const templateBytecode = fromHex(templateHex);

	const { symbol, name, description } = params;
     
    let updated;
    
	updated = update_identifiers(templateBytecode, {
		TEMPLATE: symbol,
		template: symbol.toLowerCase(),
	});

	// // Update DECIMALS
	// updated = update_constants(
	// 	templateBytecode,
	// 	bcs.u8().serialize(0).toBytes(),
	// 	bcs.u8().serialize(0).toBytes(),
	// 	"U8"
	// );

	// Update SYMBOL
	updated = update_constants(
		updated,
		bcs.string().serialize(symbol).toBytes(),
		bcs.string().serialize("TMPL").toBytes(),
		"Vector(U8)"
	);

	// Update NAME
	updated = update_constants(
		updated,
		bcs.string().serialize(name).toBytes(),
		bcs.string().serialize("template_coin").toBytes(),
		"Vector(U8)"
	);

	// Update DESCRIPTION
	updated = update_constants(
		updated,
		bcs.string().serialize(description).toBytes(),
		bcs.string().serialize("template_coin description").toBytes(),
		"Vector(U8)"
	);

	const base64Encoded = toBase64(updated);
	const tx = new Transaction();

	tx.setSender(address);

	const [upgrade_cap] = tx.publish({
		modules: [base64Encoded],
		dependencies: ["0x1", "0x2"],
	});

	tx.transferObjects([upgrade_cap], address);
	tx.setGasBudget(200000000);

	const response = await suiClient.signAndExecuteTransaction({
		transaction: tx,
		signer: signer,
		options: { showEffects: true, showEvents: true },
	});

	console.log("Template created successfully!");
    return response;
};


export default updateTemplate;
