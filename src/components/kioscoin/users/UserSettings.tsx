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
import { useUserContext } from "./UserContext";
import { useTranslation } from "react-i18next";
import PushNotificationsToggle from "@/components/kioscoin/notifications/PushNotificationsToggle";
import PaymentMethodsComponent from "../orders/create-orders/PaymentMethodsComponent";

interface UserSettingsProps {
  readonly className?: string;
}

export default function UserSettings({ className }: UserSettingsProps) {
  const { user, loginId } = useUserContext();
  const { toast } = useToast();
  const [selectedMethods, setSelectedMethods] = useState<PaymentMethod[]>([]);
  const [isSaving, setIsSaving] = useState(false);
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
        settings: {
          paymentMethods: selectedMethods.map((m) => ({ ...m })),
        },
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

        <PaymentMethodsComponent
          selectedMethods={selectedMethods}
          onChange={setSelectedMethods}
          methods={availableMethods}
          readOnly={false}
        />
        <div className="flex w-full">
          <PushNotificationsToggle userId={user!.id!}></PushNotificationsToggle>
        </div>

        <div className="flex w-full">
          <Button
            className="flex items-center w-full font-secondary font-bold border-secondary text-secondary text-sm sm:text-base py-2 px-2 hover:text-white hover:bg-secondary"
            onClick={() => {
              // Guard against any unhandled rejections in dev
              handleSave().catch(() => {});
            }}
            disabled={!isValid || isSaving}
            variant="outline"
          >
            {isSaving ? t("saving") : t("save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
