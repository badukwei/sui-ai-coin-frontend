import "@/styles/globals.css";
import type { AppProps } from "next/app";
import {
	createNetworkConfig,
	SuiClientProvider,
	WalletProvider,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
const { networkConfig } = createNetworkConfig({
	mainnet: { url: getFullnodeUrl("mainnet") },
});

export default function App({ Component, pageProps }: AppProps) {
	return (
		<QueryClientProvider client={queryClient}>
			<SuiClientProvider
				networks={networkConfig}
				defaultNetwork="mainnet"
			>
				<WalletProvider autoConnect>
					<Component {...pageProps} />
				</WalletProvider>
			</SuiClientProvider>
		</QueryClientProvider>
	);
}
