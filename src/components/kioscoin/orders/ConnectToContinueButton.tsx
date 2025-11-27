import React from "react";
import { Button } from "@/components/ui/button";
import { useWeb3Auth } from "@web3auth/modal/react";
import { useTranslation } from "react-i18next";

export const ConnectToContinueButton: React.FC = () => {
  const { connect } = useWeb3Auth();
  const { t } = useTranslation();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  return (
    <Button className="w-full bg-primary text-white" onClick={handleConnect}>
      {t("connect_to_continue")}
    </Button>
  );
};
