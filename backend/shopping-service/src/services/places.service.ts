import axios from 'axios';
import { env } from '../config/env';
import type { NearbyStore } from '../types';

const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

/**
 * Find grocery stores near the given coordinates using Google Places API.
 * Returns up to 10 results. Falls back to empty array if API key is absent or request fails.
 */
export async function findNearbyGroceryStores(
  lat: number,
  lng: number,
  radiusKm: number,
): Promise<NearbyStore[]> {
  if (!env.googlePlacesApiKey) return [];

  const radiusMeters = Math.round(radiusKm * 1000);

  try {
    const res = await axios.get(`${BASE_URL}/nearbysearch/json`, {
      params: {
        location: `${lat},${lng}`,
        radius: radiusMeters,
        type: 'grocery_or_supermarket',
        key: env.googlePlacesApiKey,
      },
      timeout: 8000,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = res.data?.results ?? [];

    return results.slice(0, 10).map((place) => {
      const loc = place.geometry?.location ?? {};
      const distKm = haversineKm(lat, lng, loc.lat ?? lat, loc.lng ?? lng);

      return {
        place_id: place.place_id ?? '',
        name: place.name ?? 'Unknown',
        address: place.vicinity ?? '',
        distance_km: Math.round(distKm * 100) / 100,
        rating: place.rating ?? null,
        open_now: place.opening_hours?.open_now ?? null,
      };
    });
  } catch {
    return [];
  }
}

/** Haversine distance in km between two lat/lng points. */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
