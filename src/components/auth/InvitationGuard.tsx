"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { InvitationScreen } from "./InvitationScreen";
import { Loader2 } from "lucide-react";

export const InvitationGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <React.Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <InvitationScreen />
      </React.Suspense>
    );
  }

  return <>{children}</>;
};
