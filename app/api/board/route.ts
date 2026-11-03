import { getLayout } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getLayout(), { headers: { "Cache-Control": "no-store" } });
}
