export default function CreatorEarningsPage() {
  return (
    <section className="tap-card p-5">
      <h1 className="text-3xl font-black text-ink">Earnings</h1>
      <p className="mt-2 text-slate-600">Creator earnings ledger will be added with affiliate campaign management.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-4">
        {["Estimated", "Pending", "Approved", "Paid"].map((label) => (
          <div key={label} className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-black uppercase text-slate-400">{label}</p>
            <p className="mt-1 text-xl font-black text-ink">₱0</p>
          </div>
        ))}
      </div>
    </section>
  );
}
