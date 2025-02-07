import { useSuiClient } from "@mysten/dapp-kit";
import { CoinMetadata } from "@mysten/sui/client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiExternalLink } from "react-icons/fi";
import truncateAddress from "@/utils/move/format/truncateAddress";

interface CoinInfoProps {
	coinAddress: string;
}

const CoinInfo: React.FC<CoinInfoProps> = ({ coinAddress }) => {
	const [coinData, setCoinData] = useState<CoinMetadata | null>(null);
	const suiClient = useSuiClient();

	useEffect(() => {
		const fetchCoinData = async () => {
			try {
				const data = await suiClient.getCoinMetadata({
					coinType: coinAddress,
				});
				setCoinData(data);
				console.log("Fetched Coin Data:", data);
			} catch (error) {
				console.error("Error fetching coin data:", error);
			}
		};

		if (coinAddress) {
			fetchCoinData();
		}
	}, [coinAddress]);

	return (
		<div className="w-full max-w-3xl bg-gray-800 text-white p-6 rounded-lg text-center shadow-lg">
			{coinData ? (
				<>
					{/* Image */}
					{coinData.iconUrl && (
						<div className="flex justify-center mb-4">
							<Image
								src={coinData.iconUrl}
								alt={coinData.name}
								width={80}
								height={80}
								className="rounded-full"
							/>
						</div>
					)}

					{/* Symbol */}
					<h2 className="text-2xl font-bold">{coinData.name}</h2>
					<p className="text-lg text-gray-300">
						Symbol: {coinData.symbol}
					</p>

					{/* Link */}
					<p className="mt-2 text-[#B0BEC5] text-md flex items-center justify-center gap-1">
						Coin Address:{" "}
						<Link
							href={`https://testnet.suivision.xyz/coin/${coinAddress}`}
							className="text-[#90CAF9] underline hover:text-[#64B5F6] flex items-center gap-1"
							target="_blank"
							rel="noopener noreferrer"
						>
							{truncateAddress(coinAddress)}
							<FiExternalLink className="inline-block text-lg" />
						</Link>
					</p>

					{/* Description */}
					<p className="text-gray-200 mt-4">{coinData.description}</p>
				</>
			) : (
				<p>Loading coin data...</p>
			)}
		</div>
	);
};

export default CoinInfo;
