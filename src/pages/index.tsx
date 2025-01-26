// import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import { FaArrowRight, FaUserCircle } from "react-icons/fa";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromHex, toHex, toBase64 } from "@mysten/sui/utils";
import {
	useCurrentWallet,
	ConnectButton,
	useSuiClient,
	useDisconnectWallet,
	useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import "@mysten/dapp-kit/dist/index.css";
import init from "@mysten/move-bytecode-template";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import updateTemplate from "@/utils/move/template";
import { mintAndTransfer } from "@/utils/move/mint";
import fetchMetadata from "@/utils/ai/openAI";
import {
	formatCreateImagePrompt,
	formatCreateTemplateResponse,
} from "@/utils/move/format";
import fetchImage from "@/utils/ai/falAI";
import CustomConnectButton from "@/components/common/CustomConnectButton";
import CustomDisconnectButton from "@/components/common/CustomDisconnectButton";

interface FormValues {
	userInput: string;
}

export default function Home() {
	// states
	// form control
	const {
		handleSubmit,
		control,
		reset,
		formState: { errors },
		trigger,
		setValue,
		watch,
		getValues,
	} = useForm<FormValues>({
		defaultValues: {
			userInput: "",
		},
	});

	// sui
	const suiClient = useSuiClient();
	const { currentWallet } = useCurrentWallet();
	const address = currentWallet?.accounts?.[0]?.address;
	const { mutateAsync: signAndExecuteTransaction } =
		useSignAndExecuteTransaction({
			execute: async ({ bytes, signature }) =>
				await suiClient.executeTransactionBlock({
					transactionBlock: bytes,
					signature,
					options: {
						showBalanceChanges: true,
						showEffects: true,
						showEvents: true,
						showInput: true,
						showObjectChanges: true,
						showRawEffects: true,
						showRawInput: true,
					},
				}),
		});

	useEffect(() => {
		const initWasm = async () => {
			try {
				await init("/move_bytecode_template_bg.wasm");
				console.log("WASM initialized successfully!");
			} catch (error) {
				console.error("Error initializing WASM:", error);
			}
		};

		initWasm();
	}, []);

	const createCoin = async (data: FormValues) => {
		const { userInput } = data;
		if (!userInput || !address) return;
		try {
			const metadata = await fetchMetadata(userInput);
			console.log(metadata);

			const prompt = formatCreateImagePrompt(metadata);
			const ImageUrl = await fetchImage(prompt);
			console.log(ImageUrl);

			const netWorkResponse = await updateTemplate(
				address,
				metadata,
				ImageUrl,
				signAndExecuteTransaction
			);
			console.log(netWorkResponse);
			const { coinType, treasuryCap, recipient } =
				formatCreateTemplateResponse(netWorkResponse);
			if (!coinType || !treasuryCap || !recipient)
				throw new Error(`API error: Fail create the coin`);
			const result = await mintAndTransfer(
				coinType,
				treasuryCap,
				recipient,
				signAndExecuteTransaction
			);
			console.log(result);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="flex flex-col min-h-screen bg-gradient-to-br from-black via-darkblue to-black">
			{/* Header */}
			<header className="flex items-center justify-between w-full p-4 bg-transparent">
				<h1 className="text-lg font-bold text-white">AI SUI MEME</h1>
				<CustomConnectButton address={address} />
				<CustomDisconnectButton address={address} />
			</header>

			{/* Main Content */}
			<main className="flex items-center flex-1 flex-col px-4 gap-20">
				<section className="relative bg-gradient-to-b from-black via-darkblue to-black flex flex-col items-center justify-center text-center px-4">
					{/* Hero Content */}
					<div className="mt-20">
						<h2 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight">
							Transform Your Ideas into Memecoins
						</h2>
						<p className="text-gray-400 text-lg lg:text-xl mt-4">
							Simply enter your text, and our AI will help you
							create a unique memecoin on the Sui blockchain.
						</p>

						<div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
							<button className="px-6 py-3 text-lg font-medium bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all">
								Start Creating →
							</button>
							<button className="px-6 py-3 text-lg font-medium bg-transparent text-white border border-gray-500 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all">
								Learn How It Works
							</button>
						</div>
					</div>

					{/* Hero Illustration */}
					<div className="mt-16">
						<div className="w-full max-w-3xl mx-auto bg-gradient-to-b from-gray-900 via-black to-gray-800 rounded-lg shadow-2xl p-10">
							<p className="text-white text-lg">
								Empowering creativity with AI and blockchain.
								Your next viral token is just a few words away.
							</p>
						</div>
					</div>
				</section>
				<section className="relative w-full max-w-3xl h-32 p-4 border border-gray-600 rounded-lg bg-gradient-to-br from-gray-800 via-gray-900 to-black shadow-lg">
					{/* Textarea */}
					<form onSubmit={handleSubmit(createCoin)}>
						<Controller
							name="userInput"
							control={control}
							render={({ field }) => (
								<textarea
									placeholder="Type your message here..."
									className="w-full h-full p-4 pr-12 border-none focus:outline-none resize-none font-sans text-white bg-transparent placeholder-gray-400"
									value={field.value}
									onChange={field.onChange}
								></textarea>
							)}
						/>

						{/* Send Button */}
						<button
							type="submit"
							className="absolute bottom-4 right-4 flex items-center justify-center w-10 h-10 text-white bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-md hover:from-blue-600 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							aria-label="Send"
						>
							<FaArrowRight size={16} />
						</button>
					</form>
				</section>
			</main>
		</div>
	);
}
