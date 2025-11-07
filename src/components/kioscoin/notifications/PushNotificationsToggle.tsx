import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  p2pMarketAPIClient as client,
  firebaseService,
} from "@/lib/APIClients";
import { useTranslation } from "react-i18next";
import { useKioscoinUserContext } from "@/components/kioscoin/users/KioscoinUserContext";

interface PushNotificationsToggleProps {
  userId: string;
}

const PushNotificationsToggle: React.FC<PushNotificationsToggleProps> = ({
  userId,
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  const { loginId } = useKioscoinUserContext();

  useEffect(() => {
    // Check current notification permission status
    if ("Notification" in window) {
      setIsSubscribed(Notification.permission === "granted");
    }
    setIsLoading(false);
  }, []);

  const handleToggle = async () => {
    try {
      if (isSubscribed) {
        // Unsubscribe logic (if needed)
        setIsSubscribed(false);
        toast({
          title: t("notifications_disabled"),
          description: t("notifications_disabled_description"),
          className: "font-secondary",
        });
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast({
          title: t("permission_denied"),
          description: t("push_notifications_disabled_description"),
          className: "font-secondary",
        });
        return;
      }

      setIsSubscribed(true);

      const token = await firebaseService.fetchToken();
      if (!token) {
        throw new Error("Failed to fetch token");
      }

      await registerToken(userId, token);
      toast({
        title: t("notifications_enabled"),
        description: t("notifications_enabled_description"),
        className: "font-secondary",
      });
    } catch (error) {
      console.error("Error handling push notifications:", error);
      toast({
        title: t("error"),
        description: t("failed_to_enable_push_notifications_description"),
        className: "font-secondary",
      });
      setIsSubscribed(false);
    }
  };

  const registerToken = async (userId: string, token: string) => {
    try {
      await client.registerPushToken(
        { token, userId },
        {
          Authorization: `Bearer ${loginId}`,
        }
      );
    } catch (error) {
      console.error("Error registering token:", error);
    }
  };

  useEffect(() => {
    firebaseService.onMessageListener((payload: any) => {
      const notificationTitle = payload.data?.title ?? "Default Title";
      const notificationOptions: NotificationOptions = {
        body: payload.data.body ?? "Default Body",
        icon: "/icons/icon-192x192.png",
      };

      if (Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(notificationTitle, notificationOptions);
          }
        });
      } else {
        new Notification(notificationTitle, notificationOptions);
      }
    });
  }, [userId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!("Notification" in window)) {
    return (
      <div className="text-sm font-semibold">
        This browser does not support push notifications.
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="push-notifications"
        checked={isSubscribed}
        onCheckedChange={handleToggle}
        className="scale-90"
      />
      <Label
        htmlFor="push-notifications"
        className="text-xs font-secondary text-dark"
      >
        {t("enable_push_notifications")}
      </Label>
    </div>
  );
};

export default PushNotificationsToggle;
