"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Separator } from "../ui/separator";
import { Order } from "b5-api-client";

interface TransactionStatusProps {
  status: "idle" | "sent" | "waiting" | "success" | "error" | "sending";
  message: string;
  progress: number;
  order?: Order;
  onClose: () => void;
}

export function TransactionStatus({
  status,
  message,
  progress,
  order,
  onClose,
}: TransactionStatusProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  useEffect(() => {
    if (status !== "idle") {
      setIsVisible(true);
    }
  }, [status]);

  if (status === "idle" || !isVisible) return null;

  const getStatusColor = (status: TransactionStatusProps["status"]) => {
    switch (status) {
      case "sent":
      case "waiting":
      case "sending":
        return "bg-primary/5 border-primary/20";
      case "success":
        return "bg-success/5 border-success/20";
      case "error":
        return "bg-error/5 border-error/20";
      default:
        return "bg-muted border-border";
    }
  };

  const getStatusIcon = (status: TransactionStatusProps["status"]) => {
    switch (status) {
      case "sent":
      case "waiting":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case "sending":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-error" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const statusMap = {
    sent: "sent",
    waiting: "waiting",
    success: "success",
    error: "error",
    sending: "sending",
  };

  const getStatusText = (status: keyof typeof statusMap) => {
    const key = statusMap[status];
    return key ? t(key) : status;
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  return (
    <div className="font-secondary fixed inset-0 flex items-center justify-center p-2 bg-black/70 z-[60]">
      <Card className="w-full max-w-sm mb-12">
        <CardContent className="pt-4 px-4">
          <Alert className={`${getStatusColor(status)} mb-4`}>
            <AlertTitle className="flex items-center gap-2 text-dark font-bold">
              {getStatusIcon(status)}
              {getStatusText(status)}
            </AlertTitle>
            <AlertDescription className="text-dark pt-2">
              {message}
            </AlertDescription>
          </Alert>
          {(status === "sent" || status === "waiting") && (
            <Progress
              value={animatedProgress}
              className="my-4 border border-primary/20"
            />
          )}
          {status === "success" && (
            <>
              <Button
                onClick={handleClose}
                className="w-full mb-4 bg-secondary text-white hover:text-secondary hover:bg-white/80 border hover:border-secondary"
              >
                {t("close")}
              </Button>
            </>
          )}
          {status === "error" && (
            <Button
              onClick={handleClose}
              className="w-full mb-4 bg-secondary text-white hover:text-secondary hover:bg-white/80 hover:border hover:border-secondary"
            >
              {t("close")}
            </Button>
          )}
        </CardContent>
        {status !== "error" && status !== "success" && (
          <>
            <Separator className="mb-2" />
            <div className="block text-center pb-1">
              <p className="text-xs text-dark block font-secondary">
                {t("not_close_app")}
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
