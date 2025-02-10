import Link from "next/link";
import React from "react";

interface Props {
	message: string;
	route: string;
}
const RoutingToast: React.FC<Props> = ({ message, route }) => {
	return (
		<div>
			<p>{message}</p>
			<Link
				href={route}
				className="text-blue-400 underline hover:text-blue-500"
			>
				Deposit more SUI
			</Link>
		</div>
	);
};

export default RoutingToast;
