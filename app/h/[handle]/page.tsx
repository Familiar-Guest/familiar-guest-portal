import { redirect } from "next/navigation";

export default async function LegacyStorefront({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  redirect(`/owner/${handle}`);
}
