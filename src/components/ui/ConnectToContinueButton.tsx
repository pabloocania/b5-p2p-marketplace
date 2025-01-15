import React from "react";
import { Button } from "@/components/ui/button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useTranslation } from "react-i18next";

export const ConnectToContinueButton: React.FC = () => {
  const { openConnectModal } = useConnectModal();
  const { t } = useTranslation();

  const handleConnect = () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  return (
    <Button className="w-full bg-primary text-white" onClick={handleConnect}>
      {t("connect_to_continue")}
    </Button>
  );
};
