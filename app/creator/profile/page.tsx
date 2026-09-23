import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth";
import { currency, number } from "@/lib/format";
import { getCreatorPortalOverview } from "@/lib/repository";

export default async function CreatorProfilePage() {
  const user = await requireAuth("creator");
  const overview = await getCreatorPortalOverview(user.id);
  if (!overview) redirect("/login?role=creator&next=/creator/profile");
  const { creator, account } = overview;

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <h1 className="text-3xl font-black text-ink">Profile</h1>
        <p className="mt-2 text-slate-600">Profile editing will be added after creator account activation is stable.</p>
      </div>
      <section className="tap-card p-5">
        <h2 className="text-xl font-black text-ink">{creator.full_name}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Info label="Login Email" value={account.email} />
          <Info label="TikTok" value={`@${creator.tiktok_username}`} />
          <Info label="Profile URL" value={creator.tiktok_profile_url || "-"} />
          <Info label="Mobile" value={creator.mobile || "-"} />
          <Info label="Location" value={creator.location || "-"} />
          <Info label="Category" value={creator.creator_category || "-"} />
          <Info label="TikTok Followers" value={number(creator.follower_count)} />
          <Info label="GMV Max" value={currency(creator.gmv_max_total)} />
        </div>
      </section>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-ink">{value}</p>
    </div>
  );
}
