import React, { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Assuming these are the correct components
import { ConfigStore } from "@/lib/ConfigStore";
import { useTranslation } from "react-i18next";

interface Blockchain {
  name: string;
  supportedCoins: string[];
}

interface BlockchainSelectorProps {
  onBlockchainChange: (blockchain: string) => void;
  onCoinChange: (coin: string) => void;
}

const BlockchainSelector: React.FC<BlockchainSelectorProps> = ({
  onBlockchainChange,
  onCoinChange,
}) => {
  const [blockchains, setBlockchains] = useState<Blockchain[]>([]);
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>("");
  const [selectedCoin, setSelectedCoin] = useState<string>("");
  const { t } = useTranslation();

  useEffect(() => {
    const config = ConfigStore.getInstance().getConfig();
    if (config) {
      setBlockchains(config.config.blockchains);
    }
  }, []);

  const handleBlockchainChange = (value: string) => {
    setSelectedBlockchain(value);
    setSelectedCoin(""); // Reset coin selection when blockchain changes
    onBlockchainChange(value); // Notify parent component
  };

  const handleCoinChange = (value: string) => {
    setSelectedCoin(value);
    onCoinChange(value); // Notify parent component
  };

  const selectedBlockchainObj = blockchains.find(
    (b) => b.name === selectedBlockchain
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      <div>
        <Select onValueChange={handleBlockchainChange} required>
          <SelectTrigger>
            <SelectValue placeholder={t("select_blockchain")} />
          </SelectTrigger>
          <SelectContent>
            {blockchains.map((blockchain) => (
              <SelectItem key={blockchain.name} value={blockchain.name}>
                {blockchain.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedBlockchainObj && (
        <div>
          <Select onValueChange={handleCoinChange} required>
            <SelectTrigger>
              <SelectValue placeholder={t("select_token")} />
            </SelectTrigger>
            <SelectContent>
              {selectedBlockchainObj.supportedCoins.map((tokenCode) => (
                <SelectItem key={tokenCode} value={tokenCode}>
                  {tokenCode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default BlockchainSelector;
