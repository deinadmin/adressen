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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, UserPlus } from "lucide-react";
import { addAddress, updateAddress, addBulkAddresses } from "@/lib/services";
import { toast } from "sonner";
import { Address } from "@/types";

const addressSchema = z.object({
  firstName: z.string().min(1, "Vorname ist erforderlich"),
  lastName: z.string().min(1, "Nachname ist erforderlich"),
  street: z.string().min(1, "Straße ist erforderlich"),
  houseNumber: z.string().min(1, "Hausnummer ist erforderlich"),
  zipCode: z.string().min(1, "PLZ ist erforderlich"),
  city: z.string().min(1, "Stadt ist erforderlich"),
  country: z.string().min(1, "Land ist erforderlich"),
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
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [address, open, form]);

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
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{address ? "Adresse bearbeiten" : "Neue Adresse hinzufügen"}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="normal" className="w-full">
          {!address && (
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="normal">
                <UserPlus className="w-4 h-4 mr-2" />
                Einzeln
              </TabsTrigger>
              <TabsTrigger value="bulk">
                <Upload className="w-4 h-4 mr-2" />
                Bulk-Import
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="normal">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitNormal)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vorname</FormLabel>
                        <FormControl>
                          <Input placeholder="Max" {...field} />
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
                          <Input placeholder="Mustermann" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Straße</FormLabel>
                          <FormControl>
                            <Input placeholder="Musterstraße" {...field} />
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
                          <Input placeholder="12a" {...field} />
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
                          <Input placeholder="12345" {...field} />
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
                            <Input placeholder="Musterstadt" {...field} />
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
                        <Input placeholder="Deutschland" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Speichern..." : address ? "Änderungen speichern" : "Adresse speichern"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {!address && (
            <TabsContent value="bulk" className="space-y-4">
              <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground whitespace-pre-wrap">
                Geben Sie die Daten im Format:{"\n"}
                Vorname, Nachname, Straße, Hausnummer, PLZ, Stadt, Land{"\n"}
                (eine Adresse pro Zeile) ein.
              </div>
              <Textarea
                placeholder="Max, Mustermann, Musterstraße, 1, 12345, Berlin, Deutschland"
                className="w-full min-h-[200px] font-mono text-xs break-all [field-sizing:manual]"
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={onSubmitBulk}
                disabled={isSubmitting || !bulkData.trim()}
              >
                {isSubmitting ? "Importieren..." : "Import starten"}
              </Button>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
