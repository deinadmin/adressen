"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Download,
  Copy,
  Trash2,
  Pencil,
  ChevronDown,
  FileSpreadsheet,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { subscribeToAddresses, deleteAddress } from "@/lib/services";
import { Address } from "@/types";
import {
  exportToExcel,
  exportToCSV,
  exportToGoogleSheets,
  copyToClipboard,
  formatAddressAsString
} from "@/lib/utils/export";
import { toast } from "sonner";
import {
  Skeleton
} from "@/components/ui/skeleton";
import { GoogleSheetsExportModal } from "./GoogleSheetsExportModal";
import { AddressDialog } from "./AddressDialog";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import excelIcon from "@/app/excel.svg";
import sheetsIcon from "@/app/sheets.svg";

const ExcelLogo = () => (
  <Image
    src={excelIcon}
    alt="Excel Logo"
    width={16}
    height={16}
    className="object-contain"
  />
);

const SheetsLogo = () => (
  <Image
    src={sheetsIcon}
    alt="Sheets Logo"
    width={14}
    height={14}
    className="object-contain"
  />
);

export const AddressList = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAddresses((data) => {
      setAddresses(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredAddresses = useMemo(() => {
    return addresses.filter(addr => {
      const searchStr = `${addr.firstName} ${addr.lastName} ${addr.city} ${addr.zipCode} ${addr.street} ${addr.country}`.toLowerCase();
      return searchStr.includes(searchQuery.toLowerCase());
    });
  }, [addresses, searchQuery]);

  const handleCopy = async (addr: Address) => {
    if (!addr.id) return;
    const formatted = formatAddressAsString(addr);
    const success = await copyToClipboard(formatted);
    if (success) {
      toast.success("Adresse kopiert");
      setCopiedId(addr.id);
      setTimeout(() => setCopiedId(null), 800);
    } else {
      toast.error("Kopieren fehlgeschlagen");
    }
  };

  const handleOpenSheetsModal = () => {
    setIsSheetsModalOpen(true);
  };

  const handleEdit = (addr: Address) => {
    setEditingAddress(addr);
    setIsAddressDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setAddressToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;
    try {
      await deleteAddress(addressToDelete);
      toast.success("Adresse erfolgreich gelöscht");
    } catch (error) {
      toast.error("Fehler beim Löschen");
    } finally {
      setIsDeleteDialogOpen(false);
      setAddressToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="border rounded-md">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full border-b" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen nach Name, Stadt, PLZ, Land..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 rounded-full h-11"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex rounded-full px-3 md:px-4 h-11 shadow-sm transition-all hover:shadow-md"
                disabled={filteredAddresses.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
                <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-2xl border-none shadow-2xl">
              <DropdownMenuLabel>Format wählen</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportToCSV(filteredAddresses)}>
                <div className="w-6 flex items-center justify-center mr-2">
                  <Download className="w-4 h-4 text-foreground" />
                </div>
                CSV (.csv)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToExcel(filteredAddresses)}>
                <div className="w-6 flex items-center justify-center mr-2">
                  <ExcelLogo />
                </div>
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenSheetsModal}>
                <div className="w-6 flex items-center justify-center mr-2">
                  <SheetsLogo />
                </div>
                Google Sheets
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="rounded-2xl border bg-card/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Adresse</TableHead>
                <TableHead className="hidden lg:table-cell">Ort</TableHead>
                <TableHead className="hidden xl:table-cell">Land</TableHead>
                <TableHead className="pl-[10px]">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAddresses.length > 0 ? (
                filteredAddresses.map((addr) => (
                  <TableRow key={addr.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium p-3 md:p-4">
                      <div className="flex flex-col">
                        <span>{addr.firstName} {addr.lastName}</span>
                        <span className="md:hidden text-xs text-muted-foreground mt-1">
                          {addr.street} {addr.houseNumber}, {addr.zipCode} {addr.city}, {addr.country}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {addr.street} {addr.houseNumber}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {addr.zipCode} {addr.city}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {addr.country}
                    </TableCell>
                    <TableCell className="p-3 md:p-4">
                      <div className="flex justify-start gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(addr)}
                          title="Kopieren"
                          className="h-8 w-8 md:h-10 md:w-10 rounded-full transition-all duration-300 relative group"
                        >
                          <div className="relative h-4 w-4">
                            <Check
                              className={cn(
                                "h-4 w-4 text-green-500 absolute inset-0 transition-all duration-300 scale-0 opacity-0",
                                copiedId === addr.id && "scale-100 opacity-100"
                              )}
                            />
                            <Copy
                              className={cn(
                                "h-4 w-4 absolute inset-0 transition-all duration-300 scale-100 opacity-100",
                                copiedId === addr.id && "scale-0 opacity-0"
                              )}
                            />
                          </div>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(addr)}
                          title="Bearbeiten"
                          className="h-8 w-8 md:h-10 md:w-10 rounded-full"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 md:h-10 md:w-10 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => openDeleteDialog(addr.id!)}
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchQuery ? "Keine Ergebnisse gefunden." : "Keine Adressen vorhanden."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Modals */}
      <GoogleSheetsExportModal
        open={isSheetsModalOpen}
        onOpenChange={setIsSheetsModalOpen}
        addresses={filteredAddresses}
      />

      <AddressDialog
        open={isAddressDialogOpen}
        onOpenChange={(open) => {
          setIsAddressDialogOpen(open);
          if (!open) setEditingAddress(null);
        }}
        address={editingAddress}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Adresse löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Adresse wird dauerhaft aus der Datenbank entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel className="rounded-full sm:flex-1">Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-full sm:flex-1 bg-destructive hover:bg-destructive/90 text-white"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
