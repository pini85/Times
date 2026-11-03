import { getTimes } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getTimes(), { headers: { "Cache-Control": "no-store" } });
}
