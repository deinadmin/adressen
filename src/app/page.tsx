"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AddressList } from "@/components/addresses/AddressList";
import { AddressDialog } from "@/components/addresses/AddressDialog";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { InviteModal } from "@/components/auth/InviteModal";
import { LogOut, Plus, UserPlus } from "lucide-react";

export default function Home() {
  const { logout } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Omas Adressbuch
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInviteModalOpen(true)}
              className="rounded-full px-4 text-muted-foreground"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Einladen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="rounded-full px-4 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </header>

        {/* List Section */}
        <AddressList />

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 md:hidden">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="icon"
            className="rounded-full h-14 w-14 shadow-2xl hover:scale-105 transition-transform bg-primary"
          >
            <Plus className="h-7 w-7" />
          </Button>
        </div>

        <AddressDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />

        <InviteModal
          open={isInviteModalOpen}
          onOpenChange={setIsInviteModalOpen}
        />
      </div>
    </main>
  );
}
