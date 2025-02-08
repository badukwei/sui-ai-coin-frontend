import { apiClient } from "@/libs/apiFactory";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { PacmanLoader } from "react-spinners";
import { BotInfo } from "@/types/move/bot";
import { useSuiClient } from "@mysten/dapp-kit";
import { configAddress } from "@/constants/move/store";
import { ContentWithUser } from "@/types/eliza/message";
import Link from "next/link";

interface Props {
	coinAddress?: string;
}

const ChatBox: React.FC<Props> = ({ coinAddress }) => {
	const [input, setInput] = useState<string>("");
	const [agentId, setAgentId] = useState<string>("");

	const suiClient = useSuiClient();
	const queryClient = useQueryClient();

	const sendMessageMutation = useMutation({
		mutationKey: ["send_message", agentId],
		mutationFn: ({
			message,
			selectedFile,
		}: {
			message: string;
			selectedFile?: File | null;
		}) => apiClient.sendMessage(agentId, message, selectedFile),
		onSuccess: (newMessages: ContentWithUser[]) => {
			console.log(newMessages);
			queryClient.setQueryData(
				["messages", agentId],
				(old: ContentWithUser[] = []) => [
					...old.filter((msg) => !msg.isLoading),
					...newMessages.map((msg) => ({
						...msg,
						createdAt: Date.now(),
					})),
				]
			);
		},
		onError: (e) => {
			console.error(e);
		},
	});

	const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!input.trim()) return;

		const newMessages = [
			{
				text: input,
				user: "user",
				createdAt: Date.now(),
			},
			{
				text: input,
				user: "system",
				isLoading: true,
				createdAt: Date.now(),
			},
		];

		queryClient.setQueryData(
			["messages", agentId],
			(old: ContentWithUser[] = []) => [...old, ...newMessages]
		);

		sendMessageMutation.mutate({
			message: input,
			selectedFile: null,
		});

		setInput("");
	};

	const messages =
		queryClient.getQueryData<ContentWithUser[]>(["messages", agentId]) ||
		[];

	const getMessageVariant = (role: string) =>
		role !== "user" ? "received" : "sent";

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
				const agentId = botInfo.bot_id;
				setAgentId(agentId);
			} catch (error) {
				console.log(error);
			}
		};
		run();
	}, [coinAddress, suiClient]);

	return (
		<div className="relative w-full max-w-3xl">
			{!agentId && (
				<div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg z-10">
					<Link
						href={`/create/${coinAddress}`}
						style={{
							padding: "12px 24px",
							backgroundColor: "rgba(255, 255, 255, 0.1)",
							border: "1px solid rgba(255, 255, 255, 0.3)",
							color: "white",
							borderRadius: "8px",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
							cursor: "pointer",
							transition:
								"all 0.3s ease, transform 0.1s ease-in-out",
						}}
						onMouseEnter={(e) => {
							(
								e.currentTarget as HTMLElement
							).style.backgroundColor =
								"rgba(255, 255, 255, 0.2)";
							(e.currentTarget as HTMLElement).style.transform =
								"scale(1.05)";
						}}
						onMouseLeave={(e) => {
							(
								e.currentTarget as HTMLElement
							).style.backgroundColor =
								"rgba(255, 255, 255, 0.1)";
							(e.currentTarget as HTMLElement).style.transform =
								"scale(1)";
						}}
						onMouseDown={(e) => {
							(e.currentTarget as HTMLElement).style.transform =
								"scale(0.95)";
						}}
						onMouseUp={(e) => {
							(e.currentTarget as HTMLElement).style.transform =
								"scale(1.05)";
						}}
					>
						Create Bot
					</Link>
				</div>
			)}

			<form
				onSubmit={handleSendMessage}
				className={`relative p-6 rounded-lg bg-black/50 shadow-lg flex flex-col gap-6 ${
					!agentId ? "opacity-30 pointer-events-none" : ""
				}`}
			>
				<div className="flex flex-col gap-6 overflow-y-auto max-h-96">
					{messages.map((message, index) => {
						const variant = getMessageVariant(message?.user);

						return (
							<div
								key={index}
								className={`flex ${
									variant === "sent"
										? "justify-end"
										: "justify-start"
								}`}
							>
								<div
									className={`flex flex-col gap-2 p-4 rounded-2xl max-w-md shadow-md ${
										variant === "sent"
											? "bg-blue-500 text-white"
											: variant === "received"
											? "bg-gray-600 text-white"
											: "bg-green-500 text-white"
									}`}
								>
									{message.isLoading &&
									message.user === "system" ? (
										<PacmanLoader
											color="#4FC3F7"
											size={14}
										/>
									) : (
										<>
											<p className="text-white break-words leading-6 text-base">
												{message.text}
											</p>
											<span className="text-xs text-gray-300 text-right">
												{dayjs(
													message.createdAt
												).format("h:mm A")}
											</span>
										</>
									)}
								</div>
							</div>
						);
					})}
				</div>

				<div className="flex items-center gap-2">
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						className="flex-1 p-2 rounded-lg border bg-gray-800 text-white"
						placeholder="Type a message..."
					/>

					<button
						type="submit"
						disabled={!input || sendMessageMutation?.isPending}
						className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer"
					>
						Send
					</button>

					<Link
						href={`/create/${coinAddress}`}
						className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center justify-center"
					>
						Update Bot
					</Link>
				</div>
			</form>
		</div>
	);
};

export default ChatBox;
