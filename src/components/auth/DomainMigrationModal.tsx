"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const DomainMigrationModal = () => {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only check in the browser
    if (typeof window !== "undefined") {
      const isOldDomain = window.location.hostname === "adressen.vercel.app";
      if (isOldDomain) {
        setIsOpen(true);
      }
    }
  }, []);

  const handleSwitchDomain = () => {
    const newDomain = "https://omasadressbuch.designedbycarl.de";
    const inviteParam = token ? `?invite=${token}` : "";
    window.location.href = `${newDomain}/${inviteParam}`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden flex flex-col items-center text-center gap-4 rounded-[2.5rem]"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex flex-col items-center gap-2">
          <DialogTitle className="text-2xl font-bold">Information</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mb-4">
            Diese App ist jetzt unter einer neuen Domain verfügbar. {token ? "Du wirst automatisch angemeldet." : "Du musst dich dort anmelden."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="w-full sm:justify-center">
          <Button
            onClick={handleSwitchDomain}
            className="w-full py-6 text-lg font-semibold rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary text-primary-foreground"
          >
            Jetzt wechseln
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
