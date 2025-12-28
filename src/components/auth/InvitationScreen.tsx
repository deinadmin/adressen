"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

export const InvitationScreen = () => {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsValidating(true);
    try {
      const success = await login(code);
      if (!success) {
        toast.error("Ungültiger Einladungscode");
      } else {
        toast.success("Willkommen!");
      }
    } catch (error) {
      toast.error("Fehler bei der Validierung");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Zugriff beschränkt</CardTitle>
          <CardDescription>
            Bitte geben Sie Ihren Einladungscode ein, um auf die Adressverwaltung zuzugreifen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Einladungscode"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center text-lg tracking-widest uppercase"
                disabled={isValidating}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isValidating || !code.trim()}
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird geprüft...
                </>
              ) : (
                "Einlösen"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
