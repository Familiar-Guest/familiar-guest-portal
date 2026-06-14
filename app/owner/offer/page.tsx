import { redirect } from "next/navigation";

// The owner portal now lives at /owner. Keep the old link working.
export default function OwnerOfferRedirect() {
  redirect("/owner");
}
