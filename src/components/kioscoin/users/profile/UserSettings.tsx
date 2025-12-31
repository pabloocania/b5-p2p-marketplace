"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import PaymentMethodSelector from "@/components/kioscoin/orders/create-orders/PaymentMethodSelector";
import type {
  PaymentMethod,
  UpdateUserSettingsRequest,
  KioscoinUser,
} from "b5-api-client";
import { p2pMarketAPIClient } from "@/lib/APIClients";
import { ConfigStore } from "@/lib/ConfigStore";
import { useKioscoinUserContext } from "../KioscoinUserContext";
import { useTranslation } from "react-i18next";
import PushNotificationsToggle from "@/components/kioscoin/notifications/PushNotificationsToggle";
import PaymentMethodsComponent from "../../orders/create-orders/PaymentMethodsComponent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportPrivateKey } from "@/components/kioscoin/security";

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
      <CardContent className="p-4 space-y-3">
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
