"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface TransactionStatusProps {
  status: "idle" | "sent" | "waiting" | "success" | "error";
  message: string;
  progress: number;
  onClose: () => void;
}

export function TransactionStatus({
  status,
  message,
  progress,
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
        return "bg-yellow-100 border-yellow-300";
      case "success":
        return "bg-green-100 border-green-300";
      case "error":
        return "bg-red-100 border-red-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  const getStatusIcon = (status: TransactionStatusProps["status"]) => {
    switch (status) {
      case "sent":
      case "waiting":
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const statusMap = {
    sent: "sent",
    waiting: "waiting",
    success: "success",
    error: "error",
    // Add more status mappings as needed
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-sm mb-12">
        <CardContent className="p-4">
          <Alert className={`mb-4 ${getStatusColor(status)}`}>
            <AlertTitle className="flex items-center gap-2">
              {getStatusIcon(status)}
              {getStatusText(status)}
            </AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
          {(status === "sent" || status === "waiting") && (
            <Progress value={animatedProgress} className="mb-4" />
          )}
          {(status === "success" || status === "error") && (
            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full mt-4"
            >
              {t("close")}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
