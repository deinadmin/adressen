"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchAddress, NominatimResult } from "@/lib/utils/nominatim";
import { Address } from "@/types";

const COUNTRIES = [
  { label: "Deutschland", code: "DE" },
  { label: "Österreich", code: "AT" },
  { label: "Schweiz", code: "CH" },
  { label: "Schweden", code: "SE" },
  { label: "Frankreich", code: "FR" },
  { label: "Italien", code: "IT" },
  { label: "Spanien", code: "ES" },
  { label: "Vereinigtes Königreich", code: "GB" },
  { label: "USA", code: "US" },
  { label: "Niederlande", code: "NL" },
  { label: "Belgien", code: "BE" },
];

interface AddressAutocompleteProps {
  onAddressSelect: (address: Partial<Address>) => void;
  defaultCountry?: string;
}

export function AddressAutocomplete({ onAddressSelect, defaultCountry = "Deutschland" }: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(() => {
    const found = COUNTRIES.find(c => c.label === defaultCountry);
    return found ? found.code : "DE";
  });

  const debouncedSearch = useCallback(
    async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      const results = await searchAddress(query, selectedCountry);

      // De-duplicate results based on key address components
      const uniqueResults = results.filter((result, index, self) => {
        const key = `${result.address.road}-${result.address.house_number}-${result.address.postcode}-${result.address.city || result.address.town || result.address.village}`;
        return index === self.findIndex((r) => {
          const rKey = `${r.address.road}-${r.address.house_number}-${r.address.postcode}-${r.address.city || r.address.town || r.address.village}`;
          return rKey === key;
        });
      });

      setSuggestions(uniqueResults);
      setIsLoading(false);
    },
    [selectedCountry]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue) {
        debouncedSearch(inputValue);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue, debouncedSearch]);

  const handleSelect = (result: NominatimResult) => {
    const addr = result.address;

    // Map Nominatim fields to our Address type
    const mappedAddress: Partial<Address> = {
      firstName: "", // user will fill this
      lastName: "",  // user will fill this
      street: addr.road || "",
      houseNumber: addr.house_number || "",
      zipCode: addr.postcode || "",
      city: addr.city || addr.town || addr.village || "",
      country: COUNTRIES.find(c => c.code === selectedCountry)?.label || "Deutschland",
    };

    onAddressSelect(mappedAddress);
    setOpen(false);
    setInputValue("");
    setSuggestions([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3">
        <div className="w-full">
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="rounded-full bg-card/50 w-full">
              <SelectValue placeholder="Land wählen" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between rounded-full bg-card/50 px-3 font-normal h-10"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Search className="h-4 w-4 shrink-0 opacity-50" />
                  <span className="truncate">
                    {inputValue || "Adresse suchen (Straße, Hausnummer...)"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-3xl border-none overflow-hidden shadow-2xl" align="start">
              <Command shouldFilter={false} className="rounded-2xl">
                <CommandInput
                  placeholder="Adresse eingeben..."
                  value={inputValue}
                  onValueChange={setInputValue}
                />
                <CommandList>
                  {isLoading && (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {!isLoading && !inputValue && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Beginne zu schreiben, um Vorschläge zu erhalten.
                    </div>
                  )}
                  {!isLoading && inputValue.length > 0 && suggestions.length === 0 && (
                    <CommandEmpty>Keine Adresse gefunden.</CommandEmpty>
                  )}
                  <CommandGroup>
                    {suggestions.map((result) => {
                      const cityName = result.address.city || result.address.town || result.address.village;
                      const hasRoad = !!result.address.road;

                      return (
                        <CommandItem
                          key={result.place_id}
                          value={result.display_name}
                          onSelect={() => handleSelect(result)}
                          className="flex flex-col items-start py-3"
                        >
                          <span className="font-medium text-sm leading-tight line-clamp-1">
                            {hasRoad ? (
                              <>{result.address.road} {result.address.house_number}</>
                            ) : (
                              <>{cityName}</>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {hasRoad ? (
                              <>{result.address.postcode} {cityName}, {COUNTRIES.find(c => c.code === selectedCountry)?.label}</>
                            ) : (
                              <>{result.address.postcode} {COUNTRIES.find(c => c.code === selectedCountry)?.label}</>
                            )}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
