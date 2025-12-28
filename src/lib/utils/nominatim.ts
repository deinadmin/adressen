export interface NominatimAddress {
  house_number?: string;
  road?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
  state?: string;
}

export interface NominatimResult {
  place_id: number;
  display_name: string;
  address: NominatimAddress;
  lat: string;
  lon: string;
}

export async function searchAddress(query: string, countryCode?: string): Promise<NominatimResult[]> {
  if (!query || query.length < 3) return [];

  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    addressdetails: "1",
    limit: "5",
  });

  if (countryCode) {
    params.append("countrycodes", countryCode.toLowerCase());
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
          // It's good practice to provide a User-Agent or email per Nominatim policy
          "User-Agent": "AddressManagementApp/1.0",
        },
      }
    );

    if (!response.ok) throw new Error("Nominatim API error");

    return await response.json();
  } catch (error) {
    console.error("Error fetching address suggestions:", error);
    return [];
  }
}
