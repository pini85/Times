import Board from "@/components/Board";
import { getTimes } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return <Board initial={await getTimes()} debug={"debug" in sp} />;
}
