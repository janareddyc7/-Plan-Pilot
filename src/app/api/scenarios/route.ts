import { unavailableFeature } from "@/lib/api/scaffold";
export async function GET() {
  return unavailableFeature("Scenario retrieval");
}
export async function POST() {
  return unavailableFeature("Scenario creation");
}
