import Link from "next/link";

import { joinCreatorCommunityAction } from "@/app/actions";
import { getCommunitySettings } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function CreatorCommunityPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; result?: string }>;
}) {
  const settings = await getCommunitySettings();
  const query = await searchParams;

  return (
    <main className="tap-shell grid gap-6 py-8 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="tap-card h-max p-6">
        <Link className="text-sm font-bold text-cyan-700" href="/vismincreatorsclub">Back to VisMin Creators Club</Link>
        <p className="mt-6 text-sm font-black uppercase text-cyan-700">Creator Community</p>
        <h1 className="mt-2 text-4xl font-black text-ink">{settings.headline}</h1>
        <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-slate-600">{settings.description}</p>
        {settings.viber_qr_image_url ? <img className="mx-auto mt-6 max-h-72 w-full rounded-lg border border-slate-200 bg-white object-contain p-4" src={settings.viber_qr_image_url} alt="Viber community QR code" /> : null}
        {settings.viber_community_link ? (
          <a className="tap-button tap-button-primary mt-5 w-full" href={settings.viber_community_link} target="_blank" rel="noreferrer">Open Viber Community</a>
        ) : null}
      </section>

      <section className="tap-card p-6">
        <h2 className="text-2xl font-black text-ink">Join the community</h2>
        <p className="mt-2 text-slate-600">Join the creator database to receive community updates, campaign opportunities, and event invitations.</p>
        {query.message ? <div className={`mt-4 rounded-lg border p-3 text-sm font-bold ${query.result === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>{query.message}</div> : null}
        <form action={joinCreatorCommunityAction} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="tap-label">
            Name <span className="text-red-400">*</span>
            <input className="tap-input" name="full_name" required />
          </label>
          <label className="tap-label">
            Email <span className="text-red-400">*</span>
            <input className="tap-input" name="email" required type="email" />
          </label>
          <label className="tap-label">
            Viber Number <span className="text-red-400">*</span>
            <input className="tap-input" name="viber_number" required type="tel" />
          </label>
          <label className="tap-label">
            TikTok Username
            <input className="tap-input" name="tiktok_username" placeholder="@username" />
          </label>
          <label className="tap-label md:col-span-2">
            TikTok Profile Link
            <input className="tap-input" name="tiktok_profile_url" type="url" placeholder="https://www.tiktok.com/@username" />
          </label>
          <button className="tap-button tap-button-primary md:col-span-2" type="submit">Join Creator Community</button>
        </form>
      </section>
    </main>
  );
}
