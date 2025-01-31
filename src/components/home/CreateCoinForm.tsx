import fetchImage from "@/utils/ai/falAI";
import fetchMetadata from "@/utils/ai/openAI";
import formatCreateImagePrompt from "@/utils/move/format/imagePrompt";
import formatCreateTemplateResponse from "@/utils/move/format/templateResponse";
import { mintWithEvent } from "@/utils/move/mintWithEvent";
import updateTemplate from "@/utils/move/template";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import init from "@mysten/move-bytecode-template";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaArrowRight } from "react-icons/fa";
import ErrorModal from "../modal/ErrorModal";
import LoadingModal from "../modal/LoadingModal";
import SuccessModal from "../modal/SuccessModal";
import { IMetadata } from "@/types/move/metadata";

interface Props {
	address?: string;
}

interface FormValues {
	userInput: string;
}

const defaultMetadata = {
	symbol: "",
	name: "",
	description: "",
	imageUrl: "",
};

const CreateCoinForm = forwardRef(({ address }: Props, ref) =>  {
	// states
	const [error, setError] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [metadata, setMetadata] = useState<IMetadata>(defaultMetadata);

	// refs
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	// form
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

	const suiClient = useSuiClient();
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

	const createCoin = async (data: FormValues) => {
		const { userInput } = data;
		if (!userInput || !address) return;
		try {
			setIsLoading(true);
			const metadata = await fetchMetadata(userInput);
			if (!metadata) throw new Error();

			const prompt = formatCreateImagePrompt(metadata);
			const imageUrl = await fetchImage(prompt);
			if (!imageUrl) throw new Error();

			const netWorkResponse = await updateTemplate(
				address,
				metadata,
				imageUrl,
				signAndExecuteTransaction
			);
			console.log(netWorkResponse);
			const { coinType, treasuryCap, recipient } =
				formatCreateTemplateResponse(netWorkResponse);
			if (!coinType || !treasuryCap || !recipient) throw new Error();
			const result = await mintWithEvent(
				coinType,
				treasuryCap,
				metadata.name,
				metadata.symbol,
				metadata.description,
				imageUrl,
				recipient,
				signAndExecuteTransaction
			);
			console.log(result);
			setIsLoading(false);
			setMetadata({
				...metadata,
				imageUrl,
			});
		} catch (error) {
			console.error(error);
			setIsLoading(false);
			setError(
				"Something went wrong while creating your memecoin. This could be due to a network issue, blockchain congestion, or an unexpected error. Please check your connection and try again later."
			);
		}
	};

	useImperativeHandle(ref, () => ({
		focusTextarea: () => {
			textareaRef.current?.focus();
		},
	}));

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

	return (
		<>
			<form
				className="relative w-full max-w-3xl h-32 p-4 border border-gray-600 rounded-lg bg-gradient-to-br from-gray-800 via-gray-900 to-black shadow-lg"
				onSubmit={handleSubmit(createCoin)}
			>
				{/* Textarea */}
				<div className="pr-12 h-full relative">
					<Controller
						name="userInput"
						control={control}
						render={({ field }) => (
							<textarea
								ref={textareaRef}
								placeholder="Type your prompt here..."
								className="w-full h-full p-4 border-none focus:outline-none resize-none font-sans text-white bg-transparent placeholder-gray-400"
								value={field.value}
								onChange={field.onChange}
							></textarea>
						)}
					/>
				</div>

				<div className="absolute bottom-4 right-4">
					<button
						type="submit"
						className="flex items-center justify-center w-8 h-8 text-white bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-md hover:from-blue-600 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						aria-label="Send"
						disabled={!address || !!error}
					>
						<FaArrowRight size={12} />
					</button>
				</div>
			</form>
			<LoadingModal
				isOpen={isLoading}
				handleClose={() => setIsLoading(false)}
			/>
			<SuccessModal
				isOpen={!!metadata.symbol}
				memecoin={metadata}
				handleClose={() => setMetadata(defaultMetadata)}
			/>
			<ErrorModal
				isOpen={!!error}
				title="Memecoin Creation Failed"
				handleClose={() => setError("")}
				errorMessage={error}
			/>
		</>
	);
});

export default CreateCoinForm;
