import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

interface OrderShareLinkProps {
  orderId: string;
  className?: string;
}

export function OrderShareLink({
  orderId,
  className = "",
}: OrderShareLinkProps) {
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
  const { t } = useTranslation();

  const handleCopyLink = async () => {
    if (!orderId) return;

    // Construir la URL completa con el ID de la orden y el componente activo
    const url = `${window.location.origin}/?component=OrderFeed&orderId=${orderId}`;

    try {
      await navigator.clipboard.writeText(url);
      setShowCopiedTooltip(true);

      // Ocultar el tooltip después de 2.5 segundos
      setTimeout(() => {
        setShowCopiedTooltip(false);
      }, 2500);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  return (
    <div className="absolute bottom-4 right-4">
      <TooltipProvider>
        <Tooltip open={showCopiedTooltip}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm"
              onClick={handleCopyLink}
            >
              <Share2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="sr-only">{t("share_order")}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            className="bg-[#63B255] text-white border-[#63B255] rounded-lg px-3 py-1"
          >
            <p className="text-sm font-medium">{t("link_copied")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
