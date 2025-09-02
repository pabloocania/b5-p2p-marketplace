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

interface UserSettingsProps {
  readonly className?: string;
}

export default function UserSettings({ className }: UserSettingsProps) {
  const { user, loginId } = useUserContext();
  const { toast } = useToast();
  const [selectedMethods, setSelectedMethods] = useState<PaymentMethod[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const availableMethods = useMemo(
    () => ConfigStore.getInstance().getPaymentMethods(),
    []
  );

  useEffect(() => {
    const saved: PaymentMethod[] | undefined = user?.settings?.paymentMethods;
    if (saved && Array.isArray(saved) && saved.length > 0) {
      setSelectedMethods(saved);
    }
  }, [user?.id]);

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
        title: "Settings saved",
        description: "Your payment method preferences were updated.",
      });
    } catch (e: any) {
      toast({
        title: "Failed to save settings",
        description: e?.message ?? "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center mb-1">
          <h3 className="text-base font-semibold text-primary">
            User settings
          </h3>
        </div>

        <PaymentMethodSelector
          selectedMethods={selectedMethods}
          onChange={setSelectedMethods}
          methods={availableMethods}
          readOnly={false}
        />

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!isValid || isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
