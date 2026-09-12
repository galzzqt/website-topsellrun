import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { getContent } from "@/lib/db";
import Dashboard from "./Dashboard";

export const metadata = { title: "Admin — TopsellRun", robots: { index: false } };

export default async function AdminPage() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  const { config, sponsors, gallery, tiers } = await getContent();
  return <Dashboard email={admin.email} config={config} sponsors={sponsors} gallery={gallery} tiers={tiers} />;
}
