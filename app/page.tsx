import Board from "@/components/Board";
import { getLayout } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return <Board initial={await getLayout()} debug={"debug" in sp} />;
}
