import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary mb-1">
            {t("help_and_tutorials")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("help_description")}
          </DialogDescription>
        </DialogHeader>

        {/* Video */}
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-primary">
            📺 {t("video_intro_title")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("video_intro_description")}
          </p>
          <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted flex items-center justify-center">
            <div className="text-muted-foreground text-sm">
              {t("video_placeholder_text", "Video placeholder")}
            </div>
          </div>
        </div>

        {/* Help Sections */}
        <div className="space-y-6 mt-6 text-sm leading-relaxed text-gray-700">
          <section className="space-y-2">
            <h3 className="font-semibold text-base text-primary">
              {t("getting_started")}
            </h3>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              {t("getting_started_description")
                .split("\n")
                .map((line, i) => (
                  <li key={i}>{line.replace(/^\d+\.\s/, "")}</li>
                ))}
            </ol>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-base text-primary">
              {t("how_to_trade")}
            </h3>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              {t("how_to_trade_description")
                .split("\n")
                .map((line, i) => (
                  <li key={i}>{line.replace(/^\d+\.\s/, "")}</li>
                ))}
            </ol>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-base text-primary">
              {t("safety_tips")}
            </h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              {t("safety_tips_description")
                .split("\n")
                .map((tip, i) => (
                  <li key={i}>{tip.replace(/^•\s/, "")}</li>
                ))}
            </ul>
          </section>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
          >
            <X className="h-4 w-4" />
            {t("close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
