import * as XLSX from "xlsx";
import { Address } from "@/types";

export const exportToExcel = (addresses: Address[]) => {
  const worksheet = XLSX.utils.json_to_sheet(addresses.map(addr => ({
    Vorname: addr.firstName,
    Nachname: addr.lastName,
    Straße: addr.street,
    Hausnummer: addr.houseNumber,
    PLZ: addr.zipCode,
    Stadt: addr.city,
    Land: addr.country
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Adressen");

  XLSX.writeFile(workbook, "Adressen_Export.xlsx");
};

export const exportToCSV = (addresses: Address[]) => {
  const headers = ["Vorname", "Nachname", "Straße", "Hausnummer", "PLZ", "Stadt", "Land"];
  const rows = addresses.map(addr => [
    addr.firstName,
    addr.lastName,
    addr.street,
    addr.houseNumber,
    addr.zipCode,
    addr.city,
    addr.country
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "Adressen_Export.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToGoogleSheets = async (addresses: Address[]) => {
  // Creating a tab-separated string for easy pasting into Sheets
  const headers = ["Vorname", "Nachname", "Straße", "Hausnummer", "PLZ", "Stadt", "Land"];
  const rows = addresses.map(addr => [
    addr.firstName,
    addr.lastName,
    addr.street,
    addr.houseNumber,
    addr.zipCode,
    addr.city,
    addr.country
  ]);

  const tsvContent = [
    headers.join("\t"),
    ...rows.map(row => row.join("\t"))
  ].join("\n");

  const success = await copyToClipboard(tsvContent);
  if (success) {
    window.open("https://sheets.new", "_blank");
  }
  return success;
};

export const formatAddressAsString = (addr: Address) => {
  return `${addr.firstName} ${addr.lastName}, ${addr.street} ${addr.houseNumber}, ${addr.zipCode} ${addr.city}, ${addr.country}`;
};

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
};
