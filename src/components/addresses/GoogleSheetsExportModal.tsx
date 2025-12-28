"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, ClipboardCheck, Check } from "lucide-react";
import { exportToGoogleSheets } from "@/lib/utils/export";
import { Address } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GoogleSheetsExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addresses: Address[];
}

export const GoogleSheetsExportModal = ({
  open,
  onOpenChange,
  addresses,
}: GoogleSheetsExportModalProps) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Reset step when modal opens/closes
  useEffect(() => {
    if (!open) {
      // Small delay to prevent visual jump while closing
      const timer = setTimeout(() => setStep(1), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleStartExport = async () => {
    const success = await exportToGoogleSheets(addresses);
    if (success) {
      toast.success("In Zwischenablage kopiert!");
      setStep(2);
    } else {
      toast.error("Kopieren fehlgeschlagen.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">Google Sheets Export</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Step 1 */}
          <div className={cn("flex gap-4 items-start transition-opacity", step === 2 && "opacity-50")}>
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors",
              step === 1 ? "bg-primary text-primary-foreground" : "bg-green-500 text-white"
            )}>
              {step === 1 ? "1" : <Check className="w-5 h-5" />}
            </div>
            <div className="space-y-2 flex-1">
              <p className="font-semibold leading-none pt-1">Google Sheets vorbereiten</p>
              <p className="text-sm text-muted-foreground">
                Klicken Sie auf den Button unten. Wir kopieren die Daten und öffnen ein leeres Blatt.
              </p>
              <Button
                onClick={handleStartExport}
                className="w-full mt-2 rounded-full font-medium"
                disabled={step === 2}
              >
                {step === 1 ? (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Sheets öffnen & Kopieren
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Daten kopiert
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Step 2 */}
          <div className={cn("flex gap-4 items-start transition-opacity", step === 1 && "opacity-50")}>
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors",
              step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              2
            </div>
            <div className="space-y-2 flex-1">
              <p className="font-semibold leading-none pt-1">Daten einfügen</p>
              <p className="text-sm text-muted-foreground">
                Wählen Sie die erste Zelle (A1) aus und drücken Sie:
              </p>
              <div className="flex items-center gap-2 mt-3">
                <kbd className="pointer-events-none inline-flex h-10 select-none items-center gap-1 rounded border bg-muted px-2.5 font-mono text-[14px] font-bold text-muted-foreground opacity-100 shadow-sm">
                  <span className="text-xs">⌘</span> CMD
                </kbd>
                <span className="text-muted-foreground font-bold">+</span>
                <kbd className="pointer-events-none inline-flex h-10 select-none items-center gap-1 rounded border bg-muted px-4 font-mono text-[14px] font-bold text-muted-foreground opacity-100 shadow-sm">
                  V
                </kbd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 p-4 rounded-2xl flex items-start gap-3 border border-border/50">
          <div className="w-5 h-5 bg-green-500/10 rounded flex items-center justify-center mt-0.5">
            <ClipboardCheck className="w-3 h-3 text-green-600" />
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Ihre Adressen werden automatisch im Tabellenaustausch-Format kopiert, das direkt von Google Sheets erkannt wird.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
