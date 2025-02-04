import { ConnectButton } from "@mysten/dapp-kit";
import React from "react";

interface Props {
  address?: string;
}

const CustomConnectButton: React.FC<Props> = ({ address }) => {
  if (address) return null;
  return (
    <ConnectButton
      style={{
        paddingTop: "12px",
        paddingRight: "24px",
        paddingLeft: "24px",
        paddingBottom: "12px",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        color: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
        transition: "all 0.3s ease, transform 0.1s ease-in-out",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor =
          "rgba(255, 255, 255, 0.2)";
        (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor =
          "rgba(255, 255, 255, 0.1)";
        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(0.95)";
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
      }}
    />
  );
};

export default CustomConnectButton;
