import { redirect } from "next/navigation";

export default async function LegacyListing({
  params,
}: {
  params: Promise<{ handle: string; slug: string }>;
}) {
  const { handle, slug } = await params;
  redirect(`/owner/${handle}/${slug}`);
}
