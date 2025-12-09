import { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface CreateOrderContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  trigger?: ReactNode;
  variant?: "sheet" | "dialog";
  className?: string;
  closeButtonPosition?: string;
  hideCloseButton?: boolean;
}

export function CreateOrderContainer({
  open,
  onOpenChange,
  children,
  trigger,
  variant = "sheet",
  className,
  closeButtonPosition,
  hideCloseButton = false,
}: CreateOrderContainerProps) {
  const { t } = useTranslation();

  if (variant === "sheet") {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
        <SheetContent
          side="bottom"
          className={`h-[90vh] overflow-y-auto ${className || ""}`}
          closeText={hideCloseButton ? "" : t("close")}
          closeButtonPosition={
            hideCloseButton ? undefined : closeButtonPosition
          }
          showCloseButton={!hideCloseButton}
        >
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl p-0 ${className || ""}`}>
        {children}
      </DialogContent>
    </Dialog>
  );
}
