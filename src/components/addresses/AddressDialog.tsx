"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, UserPlus, ChevronDown, ChevronUp, Keyboard, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { addAddress, updateAddress, addBulkAddresses } from "@/lib/services";
import { toast } from "sonner";
import { Address } from "@/types";
import { AddressAutocomplete } from "./AddressAutocomplete";

const addressSchema = z.object({
  firstName: z.string().trim().min(1, "Vorname ist erforderlich"),
  lastName: z.string().trim().min(1, "Nachname ist erforderlich"),
  street: z.string().trim().min(1, "Straße ist erforderlich"),
  houseNumber: z.string().trim().min(1, "Hausnummer ist erforderlich"),
  zipCode: z.string().trim().min(1, "PLZ ist erforderlich"),
  city: z.string().trim().min(1, "Stadt ist erforderlich"),
  country: z.string().trim().min(1, "Land ist erforderlich"),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: Address | null; // If provided, we are in edit mode
}

export const AddressDialog = ({
  open,
  onOpenChange,
  address,
}: AddressDialogProps) => {
  const [bulkData, setBulkData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [activeTab, setActiveTab] = useState<"normal" | "bulk">("normal");

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      street: "",
      houseNumber: "",
      zipCode: "",
      city: "",
      country: "Deutschland",
    },
  });

  // Load address data when editing
  useEffect(() => {
    if (address && open) {
      form.reset({
        firstName: address.firstName,
        lastName: address.lastName,
        street: address.street,
        houseNumber: address.houseNumber,
        zipCode: address.zipCode,
        city: address.city,
        country: address.country,
      });
      setShowManual(true);
    } else if (!open) {
      // Small delay to prevent visual jump while closing
      const timer = setTimeout(() => {
        form.reset({
          firstName: "",
          lastName: "",
          street: "",
          houseNumber: "",
          zipCode: "",
          city: "",
          country: "Deutschland",
        });
        setBulkData("");
        setShowManual(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [address, open, form]);

  const handleAutocompleteSelect = (data: Partial<Address>) => {
    form.setValue("street", data.street || "");
    form.setValue("houseNumber", data.houseNumber || "");
    form.setValue("zipCode", data.zipCode || "");
    form.setValue("city", data.city || "");
    form.setValue("country", data.country || "Deutschland");

    // Auto-open manual fields if house number or street is missing
    if (!data.street) {
      setShowManual(true);
      toast.info("Bitte ergänzen Sie die Straße.");
      form.trigger(["street", "houseNumber"]);
      setTimeout(() => form.setFocus("street"), 300);
    } else if (!data.houseNumber) {
      setShowManual(true);
      toast.info("Bitte ergänzen Sie die Hausnummer.");
      form.trigger("houseNumber");
      setTimeout(() => form.setFocus("houseNumber"), 300);
    } else {
      toast.success("Adresse übernommen");
    }
  };

  const onSubmitNormal = async (data: AddressFormValues) => {
    setIsSubmitting(true);
    try {
      if (address?.id) {
        await updateAddress(address.id, data);
        toast.success("Adresse erfolgreich aktualisiert");
      } else {
        await addAddress(data);
        toast.success("Adresse erfolgreich hinzugefügt");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error("Fehler beim Speichern der Adresse");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitBulk = async () => {
    if (!bulkData.trim()) return;
    setIsSubmitting(true);
    try {
      const lines = bulkData.split("\n").filter(line => line.trim());
      const addressesToBatch = lines.map(line => {
        const parts = line.split(",").map(p => p.trim());
        return {
          firstName: parts[0] || "",
          lastName: parts[1] || "",
          street: parts[2] || "",
          houseNumber: parts[3] || "",
          zipCode: parts[4] || "",
          city: parts[5] || "",
          country: parts[6] || "Deutschland",
        };
      });

      await addBulkAddresses(addressesToBatch);
      toast.success(`${addressesToBatch.length} Adressen erfolgreich hinzugefügt`);
      setBulkData("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Fehler beim Massenimport");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border-none shadow-2xl p-0">
        <motion.div
          layout
          transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
          className="p-6"
        >
          <DialogHeader className="mb-4 flex items-center justify-center h-8">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {address ? "Adresse bearbeiten" : "Neue Adresse hinzufügen"}
            </DialogTitle>
          </DialogHeader>

          {!address && (
            <div className="flex w-full bg-muted/50 rounded-full p-1 mb-4 h-11 relative overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveTab("normal")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors relative z-10",
                  activeTab === "normal" ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <UserPlus className="w-4 h-4" />
                Einzeln
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("bulk")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors relative z-10",
                  activeTab === "bulk" ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Upload className="w-4 h-4" />
                Bulk-Import
              </button>
              <motion.div
                layoutId="tab-highlight"
                className="absolute inset-y-1 bg-background rounded-full shadow-sm"
                initial={false}
                animate={{
                  x: activeTab === "normal" ? 0 : "100%",
                }}
                style={{
                  width: "calc(50% - 4px)",
                  left: "4px"
                }}
                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              />
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "normal" ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitNormal)} className="space-y-6">
                    {/* 1. Name Section */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vorname</FormLabel>
                            <FormControl>
                              <Input placeholder="Max" className="rounded-full bg-card/50 h-11 px-4" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nachname</FormLabel>
                            <FormControl>
                              <Input placeholder="Mustermann" className="rounded-full bg-card/50 h-11 px-4" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* 2. Address Input Switch Section */}
                    <div className="space-y-6 mt-4">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
                          {showManual ? "Manuelle Adresseingabe" : "Adresse suchen"}
                        </FormLabel>
                        {!address && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowManual(!showManual)}
                            className="h-7 text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70 hover:text-primary transition-colors"
                          >
                            {showManual ? (
                              <>
                                <MapPin className="w-3 h-3 mr-1" />
                                Suche nutzen
                              </>
                            ) : (
                              <>
                                <Keyboard className="w-3 h-3 mr-1" />
                                Manuelle Eingabe
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      <AnimatePresence mode="wait">
                        {!showManual ? (
                          <motion.div
                            key="search"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-2"
                          >
                            <AddressAutocomplete
                              onAddressSelect={handleAutocompleteSelect}
                              defaultCountry={form.getValues("country")}
                            />
                            <p className="text-[10px] text-muted-foreground italic">
                              Daten von OpenStreetMap (Nominatim)
                            </p>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="manual"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                          >
                            <div className="grid grid-cols-4 gap-4">
                              <div className="col-span-3">
                                <FormField
                                  control={form.control}
                                  name="street"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Straße</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Musterstraße" className="rounded-full bg-card/50 h-11 px-4" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <FormField
                                control={form.control}
                                name="houseNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nr.</FormLabel>
                                    <FormControl>
                                      <Input placeholder="12a" className="rounded-full bg-card/50 h-11 px-4" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="zipCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>PLZ</FormLabel>
                                    <FormControl>
                                      <Input placeholder="12345" className="rounded-full bg-card/50 h-11 px-4" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="col-span-2">
                                <FormField
                                  control={form.control}
                                  name="city"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Stadt</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Musterstadt" className="rounded-full bg-card/50 h-11 px-4" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            <FormField
                              control={form.control}
                              name="country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Land</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Deutschland" className="rounded-full bg-card/50 h-11 px-4" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <Button type="submit" className="w-full rounded-full h-12 text-lg font-bold shadow-lg" disabled={isSubmitting}>
                      {isSubmitting ? "Speichern..." : address ? "Änderungen speichern" : "Adresse speichern"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-xl text-sm text-muted-foreground whitespace-pre-wrap border border-border/50">
                    Geben Sie die Daten im Format:{"\n"}
                    Vorname, Nachname, Straße, Hausnummer, PLZ, Stadt, Land{"\n"}
                    (eine Adresse pro Zeile) ein.
                  </div>
                  <Textarea
                    placeholder="Max, Mustermann, Musterstraße, 1, 12345, Berlin, Deutschland"
                    className="w-full min-h-[200px] font-mono text-xs break-all [field-sizing:manual] rounded-2xl bg-card/50"
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                  />
                  <Button
                    className="w-full rounded-full h-12 text-lg font-bold shadow-lg"
                    onClick={onSubmitBulk}
                    disabled={isSubmitting || !bulkData.trim()}
                  >
                    {isSubmitting ? "Importieren..." : "Import starten"}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
