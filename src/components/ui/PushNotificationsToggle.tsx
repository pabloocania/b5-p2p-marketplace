import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { firebaseService } from "../../lib/FirebaseService";

interface PushNotificationsToggleProps {
  userId: string;
}

const PushNotificationsToggle: React.FC<PushNotificationsToggleProps> = ({
  userId,
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if ("Notification" in window) {
      checkSubscription();
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    const permission = await Notification.permission;
    setIsSubscribed(permission === "granted");
    setIsLoading(false);
  };

  const handleToggle = async () => {
    if (isSubscribed) {
      // Unsubscribe logic (if needed)
      setIsSubscribed(false);
      toast({
        title: "Notifications disabled",
        description: "You will no longer receive push notifications.",
      });
    } else {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await firebaseService.fetchToken();
          if (token) {
            await registerToken(userId, token);
            setIsSubscribed(true);
            toast({
              title: "Notifications enabled",
              description: "You will now receive push notifications.",
            });
          }
        }
      } catch (error) {
        console.error("Error subscribing to push notifications:", error);
        toast({
          title: "Error",
          description: "Failed to enable push notifications. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const registerToken = async (userId: string, token: string) => {
    try {
      await fetch("http://localhost:8080/api/notifications/register-push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "b5-p2p.vercel.app",
        },
        body: JSON.stringify({
          user_id: userId,
          token: token,
        }),
      });
    } catch (error) {
      console.error("Error registering token:", error);
    }
  };

  useEffect(() => {
    firebaseService.onMessageListener((payload: any) => {
      console.log("Message received. ", payload);
      // Customize notification handling here
    });

    firebaseService.fetchToken().then((currentToken: any) => {
      if (currentToken) {
        registerToken(userId, currentToken);
      } else {
        console.log(
          "No registration token available. Request permission to generate one."
        );
      }
    });
  }, [userId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!("Notification" in window)) {
    return <div>This browser does not support push notifications.</div>;
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="push-notifications"
        checked={isSubscribed}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="push-notifications">Enable Push Notifications</Label>
    </div>
  );
};

export default PushNotificationsToggle;
