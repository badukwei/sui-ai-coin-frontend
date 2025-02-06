import React from 'react'
import CustomConnectButton from '../common/CustomConnectButton';
import CustomDisconnectButton from '../common/CustomDisconnectButton';

interface Props {
	address?: string;
}

const Header: React.FC<Props> = ({ address }) => {
	return (
		<header
			className="flex items-center justify-between w-full p-4"
			style={{
				background:
					"linear-gradient(90deg, rgba(10,25,47,0.95) 0%, rgba(20,40,60,0.95) 100%)",
				borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
				boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
			}}
		>
			<h1 className="text-lg font-bold text-white">AI SUI MEME</h1>
			<CustomConnectButton address={address} />
			<CustomDisconnectButton address={address} />
		</header>
	);
};

export default Header
