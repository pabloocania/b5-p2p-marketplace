import { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTranslation } from "react-i18next";

interface CreateOrderContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  trigger?: ReactNode;
  variant?: "sheet" | "dialog";
  className?: string;
}

export function CreateOrderContainer({
  open,
  onOpenChange,
  children,
  trigger,
  variant = "sheet",
  className,
}: CreateOrderContainerProps) {
  const { t } = useTranslation();

  if (variant === "sheet") {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
        <SheetContent
          side="bottom"
          className={`h-[90vh] bg-backgroundMain ${className || ""}`}
          closeText={t("close")}
        >
          <VisuallyHidden>
            <SheetTitle>Create Order Dialog</SheetTitle>
          </VisuallyHidden>
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-2xl bg-backgroundMain ${className || ""}`}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
