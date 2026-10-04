import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const querySchema = z.object({ location: z.string().trim().min(3).max(100) });
const placeSchema = z.array(z.object({ lat: z.string(), lon: z.string(), display_name: z.string() })).max(10);
const elementSchema = z.object({
  type: z.enum(["node", "way", "relation"]),
  id: z.number(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  center: z.object({ lat: z.number(), lon: z.number() }).optional(),
  tags: z.record(z.string(), z.string()).optional(),
});

let nextGeocodeAt = 0;
const cache = new Map<string, { at: number; data: unknown }>();

export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) return Response.json({ error: "Account services are unavailable." }, { status: 503 });
  const { data } = await supabase.auth.getUser();
  if (!data.user) return Response.json({ error: "Sign in to search dentists." }, { status: 401 });

  const parsed = querySchema.safeParse({ location: new URL(request.url).searchParams.get("location") });
  if (!parsed.success) return Response.json({ error: "Enter a city or ZIP code." }, { status: 400 });
  const location = parsed.data.location;
  const key = location.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 60 * 60 * 1000) return Response.json(hit.data);
  if (Date.now() < nextGeocodeAt) return Response.json({ error: "Please wait a moment before searching again." }, { status: 429 });
  nextGeocodeAt = Date.now() + 1100;

  try {
    const headers = { "User-Agent": "PlanPilot/1.0 (dental benefits planning; contact: https://github.com/janareddyc7/-Plan-Pilot)", Accept: "application/json" };
    const geo = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(location)}`, { headers, signal: AbortSignal.timeout(8000) });
    if (!geo.ok) throw new Error("Location search is temporarily unavailable.");
    const places = placeSchema.parse(await geo.json());
    if (!places.length) return Response.json({ error: "Location not found. Try a nearby city or ZIP code." }, { status: 404 });
    const lat = Number(places[0].lat);
    const lon = Number(places[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error("Location coordinates are invalid.");
    const query = `[out:json][timeout:15];(nwr["amenity"="dentist"](around:12000,${lat},${lon});nwr["healthcare"="dentist"](around:12000,${lat},${lon}););out center 60;`;
    const osm = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": headers["User-Agent"] }, body: new URLSearchParams({ data: query }), signal: AbortSignal.timeout(18000) });
    if (!osm.ok) throw new Error("Dentist search is temporarily unavailable.");
    const raw = z.object({ elements: z.array(elementSchema).max(1000) }).parse(await osm.json());
    const dentists = raw.elements.flatMap((item) => {
      const latitude = item.lat ?? item.center?.lat;
      const longitude = item.lon ?? item.center?.lon;
      const name = item.tags?.name;
      if (!latitude || !longitude || !name) return [];
      const tags = item.tags ?? {};
      return [{ id: `${item.type}-${item.id}`, name, latitude, longitude,
        address: [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]].filter(Boolean).join(" "),
        phone: tags.phone || tags["contact:phone"] || "",
        website: tags.website || tags["contact:website"] || "" }];
    }).slice(0, 50);
    const payload = { location: places[0].display_name, center: { lat, lon }, dentists, source: "OpenStreetMap" };
    cache.set(key, { at: Date.now(), data: payload });
    if (cache.size > 100) cache.delete(cache.keys().next().value!);
    return Response.json(payload);
  } catch {
    return Response.json({ error: "The live map service did not respond. Try again shortly or use the insurer directory." }, { status: 502 });
  }
}
