import * as React from "react";
import Modal from "@mui/material/Modal";
import { FaCheckCircle } from "react-icons/fa";
import { IMetadata } from "@/types/move/metadata";

interface Props {
	isOpen: boolean;
	memecoin: IMetadata;
	handleClose: () => void;
}

const SuccessModal: React.FC<Props> = ({ isOpen, memecoin, handleClose }) => {
	return (
		<Modal
			open={isOpen}
			onClose={handleClose}
			aria-labelledby="modal-title"
			aria-describedby="modal-description"
		>
			<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
				<div
					className="bg-[rgba(10,25,47,0.95)] border border-[rgba(58,110,165,0.8)] shadow-[0_0_20px_rgba(58,110,165,0.8)] 
                    rounded-lg p-12 max-w-md w-full text-center flex flex-col"
				>
					{/* ✅ Success Icon */}
					<div className="flex items-center justify-center gap-2 text-[#4CAF50] font-bold text-xl">
						<FaCheckCircle className="text-green-400 text-2xl" />
						<span>Memecoin Created Successfully!</span>
					</div>

					{/* 🌟 Memecoin Image */}
					<div className="mt-4 flex justify-center">
						<img
							src={memecoin.imageUrl}
							alt={memecoin.name}
							className="w-32 h-32 rounded-lg shadow-lg"
						/>
					</div>

					{/* 🔹 Memecoin Info */}
					<p className="mt-4 text-[#E3F2FD] text-lg font-bold">
						{memecoin.name} ({memecoin.symbol})
					</p>
					<p className="mt-2 text-[#B0BEC5] text-md">
						{memecoin.description}
					</p>

					{/* 🔳 Close Button */}
					<button
						onClick={handleClose}
						className="bg-[#4CAF50] text-white px-5 py-2 rounded-lg 
                                hover:bg-green-600 hover:shadow-[0_0_10px_rgba(76,175,80,1)] 
                                transition-all duration-300 mt-6"
					>
						Close
					</button>
				</div>
			</div>
		</Modal>
	);
};

export default SuccessModal;
