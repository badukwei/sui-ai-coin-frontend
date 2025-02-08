import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { CoinMetadata } from "@mysten/sui/client";
import React, { useEffect, useState } from "react";
import { AIConfig } from "@/types/ai/eliza/character";
import { toast } from "react-toastify";
import { fetcher } from "@/libs/apiFactory";
import { createBot, updateBot } from "@/utils/move/botConfig";
import { configAddress } from "@/constants/move/store";
import { BotInfo } from "@/types/move/bot";
import { ELIZA_BASE_URL } from "@/constants";

const defaultConfig: AIConfig = {
	name: "test",
	modelProvider: "openai",
	clients: [],
	settings: {
		voice: { model: "en-US-neural" },
	},
	plugins: [],
	bio: ["AI researcher and educator focused on practical applications"],
	lore: [
		"Pioneer in open-source AI development",
		"Advocate for AI accessibility",
	],
	messageExamples: [
		[
			{
				user: "{{user1}}",
				content: { text: "What about the border crisis?" },
			},
			{
				user: "test",
				content: { text: "What about the border crisis?" },
			},
		],
	],
	postExamples: [
		"End inflation and make America affordable again.",
		"America needs law and order, not crime creation.",
	],
	topics: [
		"artificial intelligence",
		"machine learning",
		"technology education",
	],
	style: {
		all: ["explain complex topics simply", "be encouraging and supportive"],
		chat: ["use relevant examples", "check understanding"],
		post: ["focus on practical insights", "encourage learning"],
	},
	adjectives: ["knowledgeable", "approachable", "practical"],
};

interface Props {
	coinAddress: string;
	address?: string;
}

const AIConfigForm: React.FC<Props> = ({ coinAddress, address }) => {
	const [config, setConfig] = useState(defaultConfig);
	const [coinData, setCoinData] = useState<CoinMetadata | null>(null);
	const [botData, setBotData] = useState<BotInfo | null>(null);

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

	const handleChange = (
		field: string,
		value: string | number | boolean | string[]
	) => {
		setConfig((prev) => ({ ...prev, [field]: value }));
	};

	const handleArrayChange = (field: string, index: number, value: string) => {
		const newArray = [
			...(config[field as keyof typeof config] as string[]),
		];
		newArray[index] = value;
		handleChange(field, newArray);
	};

	const handleAddArrayItem = <K extends keyof AIConfig>(field: K) => {
		if (Array.isArray(config[field])) {
			setConfig((prev) => ({
				...prev,
				[field]: [...(prev[field] as string[]), ""],
			}));
		} else {
			console.error(
				`Error: '${field}' is not an array and cannot be modified dynamically.`
			);
		}
	};

	const handleRemoveArrayItem = <K extends keyof AIConfig>(
		field: K,
		index: number
	) => {
		if (Array.isArray(config[field])) {
			setConfig((prev) => {
				const updatedArray = [...(prev[field] as string[])];
				updatedArray.splice(index, 1);
				return { ...prev, [field]: updatedArray };
			});
		} else {
			console.error(
				`Error: '${field}' is not an array and cannot be modified dynamically.`
			);
		}
	};

	const handleMessageExampleChange = (
		pairIndex: number,
		messageIndex: 0 | 1,
		value: string
	) => {
		setConfig((prev) => {
			const updatedExamples = [...prev.messageExamples];
			updatedExamples[pairIndex][messageIndex].content.text = value;
			return { ...prev, messageExamples: updatedExamples };
		});
	};

	const handleAddMessageExample = () => {
		setConfig((prev) => ({
			...prev,
			messageExamples: [
				...prev.messageExamples,
				[
					{ user: "{{user1}}", content: { text: "" } }, // First user always "{{user1}}"
					{ user: prev.name, content: { text: "" } }, // Second user always `config.name`
				],
			],
		}));
	};

	const handleRemoveMessageExample = (pairIndex: number) => {
		setConfig((prev) => {
			const updatedExamples = [...prev.messageExamples];
			updatedExamples.splice(pairIndex, 1);
			return { ...prev, messageExamples: updatedExamples };
		});
	};

	const save = async () => {
		if (!coinData) {
			toast.error("Missing coin data!");
			return;
		}
		if (!address) {
			toast.error("Please log in with your wallet!");
			return;
		}

		try {
			const response = await fetcher({
				url: "/agent/start",
				method: "POST",
				body: { characterJson: config },
			});
			console.log(response);
			const botId = (response.id as string) || "";
			const { name, symbol } = coinData;
			const botJsonString = JSON.stringify(config);
			const { data } = await suiClient.getCoins({
				owner: address,
				coinType: coinAddress,
			});
			const coinObjectId = data[0].coinObjectId;
			const suiResponse = await createBot(
				coinAddress,
				coinAddress,
				coinObjectId,
				botId,
				name,
				symbol,
				botJsonString,
				signAndExecuteTransaction
			);
			console.log(suiResponse);
			toast.success("Bot created successfully!");
		} catch (error) {
			console.error(error);
			toast.error("An error occurred while creating the bot!");
		}
	};

	const update = async () => {
		const agentId = botData?.bot_id;
		if (!agentId) {
			toast.error("Missing bot data!");
			return;
		}
		if (!address) {
			toast.error("Please log in with your wallet!");
			return;
		}
		try {
			const deleteResponse = await fetch(
				`${ELIZA_BASE_URL}/agents/${agentId}`,
				{ method: "DELETE" }
			);
			console.log(deleteResponse);
			const response = await fetcher({
				url: "/agent/start",
				method: "POST",
				body: { characterJson: config },
			});
			console.log(response);
			const botJsonString = JSON.stringify(config);
			const { bot_id, name, symbol } = botData;
			const suiResponse = await updateBot(
				coinAddress,
				address,
				coinAddress,
				bot_id,
				name,
				symbol,
				botJsonString,
				signAndExecuteTransaction
			);
			console.log(suiResponse);
			toast.success("Bot updated successfully!");
		} catch (error) {
			console.error(error);
			toast.error("An error occurred while updating the bot!");
		}
	};

	useEffect(() => {
		const fetchCoinData = async () => {
			try {
				const data = await suiClient.getCoinMetadata({
					coinType: coinAddress,
				});
				setCoinData(data);
				handleChange("name", data?.symbol ?? "Default");
				console.log("Fetched Coin Data:", data);
			} catch (error) {
				console.error("Error fetching coin data:", error);
			}
		};

		if (coinAddress) {
			fetchCoinData();
		}
	}, [coinAddress, suiClient]);

	useEffect(() => {
		const run = async () => {
			const name = {
				type: "0x1::string::String",
				value: coinAddress,
			};
			try {
				const { data } = await suiClient.getDynamicFieldObject({
					parentId: configAddress,
					name: name,
				});
				const objectId = data?.objectId;
				if (!objectId) throw new Error();
				const response = await suiClient.getObject({
					id: objectId,
					options: {
						showContent: true,
					},
				});
				const object = response.data;
				if (object?.content?.dataType !== "moveObject")
					throw new Error();
				const botInfo = object.content.fields as unknown as BotInfo;
				setBotData(botInfo);
				const botConfig = JSON.parse(botInfo.bot_json) as AIConfig;
				console.log(botConfig);
				setConfig(botConfig);
			} catch (error) {
				console.log(error);
			}
		};
		run();
	}, [coinAddress, suiClient]);

	return (
		<div className="w-full max-w-3xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
			<h2 className="text-2xl font-semibold mb-4">
				AI Configuration Form
			</h2>
			<div className="d-flex flex-col gap-4">
				{/* Name */}
				<div>
					<h3 className="text-lg font-semibold mt-6">Name</h3>
					<input
						type="text"
						value={config.name}
						disabled // Disabled field
						className="w-full p-2 rounded bg-gray-700 text-gray-400 mb-4 opacity-50 cursor-not-allowed"
					/>
				</div>

				{/* Model Provider */}
				<div>
					<h3 className="text-lg font-semibold mt-6">
						Model Provider
					</h3>
					<input
						type="text"
						value={config.modelProvider}
						disabled // Disabled field
						className="w-full p-2 rounded bg-gray-700 text-gray-400 mb-4 opacity-50 cursor-not-allowed"
					/>
				</div>

				{/* Voice Model */}
				<div>
					<h3 className="text-lg font-semibold mt-6">Voice Model</h3>
					<input
						type="text"
						value={config.settings.voice.model}
						disabled // Disabled field
						className="w-full p-2 rounded bg-gray-700 text-gray-400 mb-4 opacity-50 cursor-not-allowed"
					/>
				</div>

				{/* Bio */}
				<div>
					<h3 className="text-lg font-semibold mt-6">Bio</h3>
					{config.bio.map((item, index) => (
						<input
							key={index}
							type="text"
							value={item}
							onChange={(e) =>
								handleArrayChange("bio", index, e.target.value)
							}
							className="w-full p-2 rounded bg-gray-800 text-white mb-2"
						/>
					))}
				</div>

				{/* Lore */}
				<div>
					<h3 className="text-lg font-semibold mt-6">Lore</h3>
					{config.lore.map((item, index) => (
						<div
							key={index}
							className="flex items-center gap-2 mb-2"
						>
							<input
								type="text"
								value={item}
								onChange={(e) =>
									handleArrayChange(
										"lore",
										index,
										e.target.value
									)
								}
								className="w-full p-2 rounded bg-gray-800 text-white"
							/>
							<button
								onClick={() =>
									handleRemoveArrayItem("lore", index)
								}
								className="p-2 bg-red-500 text-white rounded"
							>
								✖
							</button>
						</div>
					))}
					<button
						onClick={() => handleAddArrayItem("lore")}
						className="p-2 bg-blue-500 text-white rounded w-full mt-2"
					>
						+ Add Lore
					</button>
				</div>

				{/* Message Examples */}
				<div>
					<h3 className="text-lg font-semibold mt-6">
						Message Examples
					</h3>
					{config.messageExamples.map((examplePair, pairIndex) => (
						<div
							key={pairIndex}
							className="bg-gray-800 p-4 rounded-lg mb-4"
						>
							{/* First User ("{{user1}}") */}
							<label className="block text-sm text-gray-400">
								User Prompt:
							</label>
							<input
								type="text"
								value={examplePair[0].content.text}
								onChange={(e) =>
									handleMessageExampleChange(
										pairIndex,
										0,
										e.target.value
									)
								}
								className="w-full p-2 rounded bg-gray-700 text-white mb-2"
							/>

							{/* Second User (config.name) */}
							<label className="block text-sm text-gray-400">
								Response ({config.name}):
							</label>
							<input
								type="text"
								value={examplePair[1].content.text}
								onChange={(e) =>
									handleMessageExampleChange(
										pairIndex,
										1,
										e.target.value
									)
								}
								className="w-full p-2 rounded bg-gray-700 text-white mb-2"
							/>

							{/* Remove Button */}
							<button
								onClick={() =>
									handleRemoveMessageExample(pairIndex)
								}
								className="p-2 bg-red-500 text-white rounded w-full mt-2"
							>
								✖ Remove Message Example
							</button>
						</div>
					))}

					{/* Add New Example Pair Button */}
					<button
						onClick={handleAddMessageExample}
						className="p-2 bg-blue-500 text-white rounded w-full mt-2"
					>
						+ Add Message Example
					</button>
				</div>

				{/* Post Examples */}
				<div>
					<h3 className="text-lg font-semibold mt-6">
						Post Examples
					</h3>
					{config.postExamples.map((post, index) => (
						<div
							key={index}
							className="flex items-center gap-2 mb-2"
						>
							<input
								type="text"
								value={post}
								onChange={(e) =>
									handleArrayChange(
										"postExamples",
										index,
										e.target.value
									)
								}
								className="w-full p-2 rounded bg-gray-800 text-white"
							/>
							<button
								onClick={() =>
									handleRemoveArrayItem("postExamples", index)
								}
								className="p-2 bg-red-500 text-white rounded"
							>
								✖
							</button>
						</div>
					))}
					<button
						onClick={() => handleAddArrayItem("postExamples")}
						className="p-2 bg-blue-500 text-white rounded w-full mt-2"
					>
						+ Add Post Example
					</button>
				</div>

				{/* Topics */}
				<div>
					<h3 className="text-lg font-semibold mt-6">Topics</h3>
					{config.topics.map((topic, index) => (
						<div
							key={index}
							className="flex items-center gap-2 mb-2"
						>
							<input
								type="text"
								value={topic}
								onChange={(e) =>
									handleArrayChange(
										"topics",
										index,
										e.target.value
									)
								}
								className="w-full p-2 rounded bg-gray-800 text-white"
							/>
							<button
								onClick={() =>
									handleRemoveArrayItem("topics", index)
								}
								className="p-2 bg-red-500 text-white rounded"
							>
								✖
							</button>
						</div>
					))}
					<button
						onClick={() => handleAddArrayItem("topics")}
						className="p-2 bg-blue-500 text-white rounded w-full mt-2"
					>
						+ Add Topic
					</button>
				</div>

				{/* Adjectives */}
				<div>
					<h3 className="text-lg font-semibold mt-6">Adjectives</h3>
					{config.adjectives.map((adj, index) => (
						<div
							key={index}
							className="flex items-center gap-2 mb-2"
						>
							<input
								type="text"
								value={adj}
								onChange={(e) =>
									handleArrayChange(
										"adjectives",
										index,
										e.target.value
									)
								}
								className="w-full p-2 rounded bg-gray-800 text-white"
							/>
							<button
								onClick={() =>
									handleRemoveArrayItem("adjectives", index)
								}
								className="p-2 bg-red-500 text-white rounded"
							>
								✖
							</button>
						</div>
					))}
					<button
						onClick={() => handleAddArrayItem("adjectives")}
						className="p-2 bg-blue-500 text-white rounded w-full mt-2"
					>
						+ Add Adjective
					</button>
				</div>

				{/* JSON Preview */}
				<div className="mt-6 p-4 bg-gray-800 rounded-lg">
					<h3 className="text-lg font-semibold mb-2">JSON Preview</h3>
					<pre className="text-sm bg-gray-700 p-3 rounded-lg">
						{JSON.stringify(config, null, 2)}
					</pre>
				</div>

				{/* Save Button */}
				{!botData ? (
					<button
						onClick={save}
						className="mt-4 w-full p-3 bg-blue-500 hover:bg-blue-600 rounded-lg"
					>
						Save Config
					</button>
				) : (
					<button
						onClick={update}
						className="mt-4 w-full p-3 bg-blue-500 hover:bg-blue-600 rounded-lg"
					>
						Update Config
					</button>
				)}
			</div>
		</div>
	);
};

export default AIConfigForm;
