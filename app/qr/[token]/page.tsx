import QRCode from "qrcode";
import { notFound } from "next/navigation";

import { CreatorQrActions } from "@/components/CreatorQrActions";
import { getQrPage } from "@/lib/repository";
import { currency, number } from "@/lib/format";

function qrStatusCopy(status: string, registrationStatus?: string) {
  if (status === "active") {
    return {
      label: "Active",
      className: "bg-green-50 text-green-700",
      title: "Ready for sample claims",
      body: "This QR can now be scanned by event sellers."
    };
  }
  if (status === "approved_not_checked_in" || registrationStatus === "approved") {
    return {
      label: "Approved",
      className: "bg-cyan-50 text-cyan-800",
      title: "Check-in required",
      body: "Your registration is approved. This QR becomes valid for sample claims after TAP staff checks you in onsite."
    };
  }
  if (status === "revoked") {
    return {
      label: "Not eligible",
      className: "bg-red-50 text-red-700",
      title: "QR not active",
      body: "This QR is not eligible for seller sample claims."
    };
  }
  return {
    label: "Pending approval",
    className: "bg-amber-50 text-amber-800",
    title: "Your QR has been created",
    body: "Your QR code has been created. Bring it with you to the event. You can use it to claim seller samples once iPlast has approved your request and checked you in."
  };
}

export default async function QrPage({
  params,
  searchParams
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const data = await getQrPage(token);
  if (!data) notFound();
  const image = await QRCode.toDataURL(data.qr.qr_url, { margin: 1, width: 360 });
  const status = qrStatusCopy(data.qr.status, data.registration?.registration_status);

  return (
    <main className="tap-shell grid min-h-[calc(100vh-64px)] place-items-center py-8">
      <section className="tap-card w-full max-w-lg p-6 text-center">
        {query.created ? (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">
            Your QR code has been created. Bring it with you to the event. You can use it to claim seller samples once iPlast has approved your request and checked you in.
          </div>
        ) : null}
        <p className="text-sm font-black uppercase text-cyan-700">{data.event.event_name}</p>
        <h1 className="mt-3 text-3xl font-black text-ink">{data.creator.full_name}</h1>
        <p className="font-bold text-slate-500">@{data.creator.tiktok_username}</p>
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <span className={`status-pill ${status.className}`}>{status.label}</span>
          <h2 className="mt-3 text-xl font-black text-ink">{status.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{status.body}</p>
        </div>
        <div className="my-6 rounded-lg bg-white p-3 shadow-inner">
          <img className="mx-auto size-72 max-w-full" src={image} alt="Creator event QR code" />
        </div>
        <CreatorQrActions image={image} qrUrl={data.qr.qr_url} creatorName={data.creator.full_name} />
        <div className="grid grid-cols-3 gap-2 text-left">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-500">Last Month GMV</p>
            <p className="font-black text-ink">{currency(data.creator.gmv_max_total)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-500">Followers</p>
            <p className="font-black text-ink">{number(data.creator.follower_count)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-500">Status</p>
            <p className="font-black text-ink">{status.label}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
