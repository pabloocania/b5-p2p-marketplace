import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { firebaseService } from "../../lib/FirebaseService";
import { p2pMarketAPIClient as client } from "../../lib/APIClients";
import { useTranslation } from "react-i18next";

interface PushNotificationsToggleProps {
  userId: string;
}

const PushNotificationsToggle: React.FC<PushNotificationsToggleProps> = ({
  userId,
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

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
          title: "Notifications disabled",
          description: "You will no longer receive push notifications.",
        });
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast({
          title: "Permission Denied",
          description: "Push notifications are disabled.",
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
        title: "Notifications enabled",
        description: "You will now receive push notifications.",
      });
    } catch (error) {
      console.error("Error handling push notifications:", error);
      toast({
        title: "Error",
        description: "Failed to enable push notifications. Please try again.",
        variant: "destructive",
      });
      setIsSubscribed(false);
    }
  };

  const registerToken = async (userId: string, token: string) => {
    try {
      await client.registerPushToken({ token, userId });
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
      />
      <Label htmlFor="push-notifications">
        {t("enable_push_notifications")}
      </Label>
    </div>
  );
};

export default PushNotificationsToggle;
