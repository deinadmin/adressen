"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Plus, Check } from "lucide-react";
import { createInvitationCode, getInvitationCode } from "@/lib/services";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteModal = ({ open, onOpenChange }: InviteModalProps) => {
  const [code, setCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const handleCreate = async () => {
    if (!code.trim()) return;
    const cleanCode = code.trim().toUpperCase();
    setIsCreating(true);
    try {
      // Check if code already exists
      const existing = await getInvitationCode(cleanCode);

      if (!existing) {
        await createInvitationCode(cleanCode);
      }

      const link = `https://omasadressbuch.designedbycarl.de/?invite=${encodeURIComponent(cleanCode)}`;
      setCreatedLink(link);
      toast.success(existing ? "Einladung bereits vorhanden - Link generiert" : "Einladungscode erstellt!");
    } catch (error) {
      toast.error("Fehler beim Erstellen des Codes");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = () => {
    if (!createdLink) return;
    navigator.clipboard.writeText(createdLink);
    setHasCopied(true);
    toast.success("Link kopiert!");
    setTimeout(() => setHasCopied(false), 2000);
  };

  const reset = () => {
    setCode("");
    setCreatedLink(null);
    setHasCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) setTimeout(reset, 300);
    }}>
      <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {createdLink ? "Einladung bereit" : "Neue Einladung erstellen"}
          </DialogTitle>
        </DialogHeader>

        {!createdLink ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Z.B. MAX010199"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="mt-3 text-center text-lg font-bold tracking-widest h-12 rounded-full h-12"
              />
            </div>
            <Button
              className="w-full h-12 rounded-full font-bold text-lg shadow-lg"
              disabled={!code.trim() || isCreating}
              onClick={handleCreate}
            >
              {isCreating ? "Erstellen..." : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Einladung erstellen
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4 flex flex-col items-center">
            {/* QR Code */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50">
              <QRCodeSVG value={createdLink} size={180} level="H" />
            </div>

            <p className="text-sm text-center text-muted-foreground px-4">
              Teilen Sie diesen Link oder QR-Code mit der Person, die Sie einladen möchten.
            </p>

            <div className="w-full flex gap-2">
              <Input
                readOnly
                value={createdLink}
                className="bg-muted/50 border-none rounded-full font-mono text-xs px-4 h-10"
              />
              <Button
                size="icon"
                className="shrink-0 rounded-full w-12 h-10"
                onClick={copyToClipboard}
              >
                {hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full rounded-full"
              onClick={reset}
            >
              Noch eine erstellen
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
