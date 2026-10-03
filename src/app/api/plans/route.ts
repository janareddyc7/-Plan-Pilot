import { unavailableFeature } from "@/lib/api/scaffold";
export async function GET() {
  return unavailableFeature("Plan retrieval");
}
export async function POST() {
  return unavailableFeature("Plan creation");
}
