"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { PaymentMethod, UpdateUserSettingsRequest } from "b5-api-client";
import { p2pMarketAPIClient } from "@/lib/APIClients";
import { ConfigStore } from "@/lib/ConfigStore";
import { useKioscoinUserContext } from "../KioscoinUserContext";
import { useTranslation } from "react-i18next";
import PushNotificationsToggle from "@/components/kioscoin/notifications/PushNotificationsToggle";
import PaymentMethodsComponent from "../../orders/create-orders/PaymentMethodsComponent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportPrivateKey } from "@/components/kioscoin/security";
import { useEtherspotSdk } from "@/components/web3/AccountAbstraction/EtherspotSdkProvider";
import { Copy, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface UserSettingsProps {
  readonly className?: string;
}

export default function UserSettings({ className }: UserSettingsProps) {
  const { user, loginId } = useKioscoinUserContext();
  const { toast } = useToast();
  const [selectedMethods, setSelectedMethods] = useState<PaymentMethod[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("payments");
  const { t } = useTranslation();
  const { eoaAddress, swAddress } = useEtherspotSdk();

  const truncateAddress = (addr: string) =>
    addr ? `${addr.slice(0, 10)}...${addr.slice(-8)}` : "";

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast({
        title: t("copied"),
        className: "font-secondary",
      });
    } catch {
      // Ignore copy errors
    }
  };

  const availableMethods = useMemo(
    () => ConfigStore.getInstance().getPaymentMethods(),
    []
  );

  useEffect(() => {
    const saved: PaymentMethod[] | undefined = user?.settings?.paymentMethods;
    if (Array.isArray(saved)) {
      setSelectedMethods(saved);
    } else {
      setSelectedMethods([]);
    }
  }, [user?.id, user?.settings?.paymentMethods]);

  const isValid = useMemo(() => {
    return (
      !!user?.id &&
      selectedMethods.some((m) => (m.entity?.trim()?.length ?? 0) > 0)
    );
  }, [user?.id, selectedMethods]);

  const handleSave = async () => {
    if (!user?.id || !loginId || !isValid) return;
    setIsSaving(true);
    try {
      const request: UpdateUserSettingsRequest = {
        userId: user.id,
        settings: (() => {
          const settingsPayload: UpdateUserSettingsRequest["settings"] = {
            paymentMethods: selectedMethods.map((m) => ({ ...m })),
            hasVerified: user.settings?.hasVerified ?? false,
          };

          const preferredToken = user.settings?.preferredTokenCode;
          if (preferredToken !== undefined) {
            settingsPayload.preferredTokenCode = preferredToken;
          }

          return settingsPayload;
        })(),
      };

      await p2pMarketAPIClient.updateUserSettings(request, {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginId}`,
      });

      toast({
        title: t("settings_saved"),
        className: "font-secondary",
      });
    } catch (e: any) {
      // Ensure we never rethrow; always surface as toast
      const status = e?.response?.status;
      const message = t("settings_save_error");
      toast({
        title: message,
        className: "font-secondary",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className={`border-0 ${className}`}>
      <CardContent className="p-2 space-y-3">
        <div className="flex items-center mb-1">
          <p className="font-primary text-dark text-xs flex-grow">
            {t("preferences")}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-3 bg-secondary/10">
            <TabsTrigger
              value="payments"
              className="text-dark text-xs font-secondary"
            >
              {t("payment_methods")}
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="text-dark text-xs font-secondary"
            >
              {t("notifications")}
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="text-dark text-xs font-secondary"
            >
              {t("security.tab_title")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-3">
            <PaymentMethodsComponent
              selectedMethods={selectedMethods}
              onChange={setSelectedMethods}
              methods={availableMethods}
              readOnly={false}
            />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-3">
            <div className="flex w-full">
              <PushNotificationsToggle
                userId={user!.id!}
              ></PushNotificationsToggle>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            {/* Wallet Addresses */}
            {(eoaAddress || swAddress) && (
              <div className="space-y-2 p-3 bg-secondary/5 rounded-lg">
                {/* Header with Info Popover */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-secondary text-dark font-bold">
                    {t("security.your_addresses")}
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-primary hover:bg-terciary"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="left"
                      className="max-w-[280px] p-3 font-secondary text-xs"
                    >
                      {t("security.addresses_explanation")}
                    </PopoverContent>
                  </Popover>
                </div>

                {/* EOA Address */}
                {eoaAddress && (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-secondary text-primary font-bold">
                        {t("security.eoa_address")}
                      </p>
                      <p className="text-xs font-mono text-dark">
                        {truncateAddress(eoaAddress)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-dark hover:bg-terciary"
                      onClick={() => handleCopyAddress(eoaAddress)}
                      title={t("copy")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* Smart Wallet Address */}
                {swAddress && (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-secondary text-primary font-bold">
                        {t("security.smart_wallet_address")}
                      </p>
                      <p className="text-xs font-mono text-dark">
                        {truncateAddress(swAddress)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-dark hover:bg-terciary"
                      onClick={() => handleCopyAddress(swAddress)}
                      title={t("copy")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-center font-secondary text-dark">
              {t("security.backup_description")}
            </p>
            <p className="text-xs text-center font-secondary text-dark font-bold">
              {t("security.key_never_ask")}
            </p>
            <ExportPrivateKey />
          </TabsContent>
        </Tabs>

        {activeTab === "payments" && (
          <div className="flex w-full">
            <Button
              className="font-secondary w-full items-center gap-2 text-xs border-primary text-dark hover:bg-terciary"
              onClick={() => {
                handleSave().catch(() => {});
              }}
              disabled={!isValid || isSaving}
              variant="outline"
            >
              {isSaving ? t("saving") : t("save")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
