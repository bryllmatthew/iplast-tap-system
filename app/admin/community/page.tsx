import Link from "next/link";
import QRCode from "qrcode";

import { saveCommunitySettingsAction } from "@/app/actions";
import { CommunityQrActions } from "@/components/CommunityQrActions";
import { appUrl } from "@/lib/env";
import { getCommunitySettings } from "@/lib/repository";

export default async function AdminCommunityPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; result?: string }>;
}) {
  const settings = await getCommunitySettings();
  const query = await searchParams;
  const communityUrl = appUrl("/vismincreatorsclub/community");
  const communityQrImage = await QRCode.toDataURL(communityUrl, { margin: 1, width: 420 });

  return (
    <section className="space-y-5">
      <div className="tap-card p-5">
        <p className="text-sm font-black uppercase text-cyan-700">Creator Community</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Community signup settings</h1>
        <p className="mt-2 text-slate-600">Configure the public page where creators can join the VisMin Creators Club without attending an event.</p>
        <Link className="mt-4 inline-flex text-sm font-bold text-cyan-700 underline" href="/vismincreatorsclub/community" target="_blank" rel="noreferrer">
          View public community page
        </Link>
        {query.message ? <div className={`mt-4 rounded-lg border p-3 text-sm font-bold ${query.result === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>{query.message}</div> : null}
      </div>

      <form action={saveCommunitySettingsAction} encType="multipart/form-data" className="tap-card grid gap-4 p-5">
        <label className="tap-label">
          Community Name
          <input className="tap-input" name="community_name" required defaultValue={settings.community_name} />
        </label>
        <label className="tap-label">
          Headline
          <input className="tap-input" name="headline" required defaultValue={settings.headline} />
        </label>
        <label className="tap-label">
          Description
          <textarea className="tap-input min-h-32" name="description" defaultValue={settings.description} />
        </label>
        <label className="tap-label">
          Viber Community Link
          <input className="tap-input" name="viber_community_link" type="url" defaultValue={settings.viber_community_link || ""} placeholder="https://invite.viber.com/..." />
        </label>
        <label className="tap-label">
          Viber Community QR Code
          <input className="tap-input" name="viber_qr_image" type="file" accept="image/*" />
        </label>
        {settings.viber_qr_image_url ? <img className="max-h-64 w-64 rounded-lg border border-slate-200 bg-white object-contain p-3" src={settings.viber_qr_image_url} alt="Viber community QR code" /> : null}
        <button className="tap-button tap-button-primary w-fit" type="submit">Save Community Settings</button>
      </form>

      <section className="tap-card flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
        <img className="size-48 rounded-lg border border-slate-200 bg-white p-2" src={communityQrImage} alt="Community signup QR code" />
        <div>
          <p className="text-sm font-black uppercase text-cyan-700">Admin-only QR controls</p>
          <h2 className="mt-1 text-xl font-black text-ink">Community signup QR code</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Download this QR for Facebook posts, print materials, or event promotions. It opens the public community signup form.</p>
          <CommunityQrActions image={communityQrImage} communityUrl={communityUrl} />
        </div>
      </section>
    </section>
  );
}
