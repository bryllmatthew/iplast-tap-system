import { loginAction } from "@/app/actions";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; role?: string; message?: string }>;
}) {
  const query = await searchParams;
  const role = query.role === "seller" ? "seller" : query.role === "creator" ? "creator" : "admin";
  const next = query.next || (role === "seller" ? "/seller" : role === "creator" ? "/creator" : "/admin");
  const title = role === "seller" ? "Seller Login" : role === "creator" ? "Creator Login" : "Admin Login";

  return (
    <main className="tap-shell grid min-h-[calc(100vh-64px)] place-items-center py-8">
      <section className="tap-card w-full max-w-md p-6">
        <p className="text-sm font-black uppercase text-cyan-700">{title}</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Sign in to TAP System</h1>
        <p className="mt-2 text-slate-600">
          {role === "admin" ? "Use the default TAP admin credentials." : "Use the login details provided by TAP Admin."}
        </p>
        {query.message ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{query.message}</div>
        ) : null}
        <form action={loginAction} className="mt-5 grid gap-4">
          <input type="hidden" name="role" value={role} />
          <input type="hidden" name="next" value={next} />
          <label className="tap-label">
            {role === "admin" ? "Username or Email" : role === "seller" ? "Username" : "Email"}
            <input className="tap-input" name="username" required autoComplete="username" placeholder={role === "admin" ? "TAPAdmin" : role === "seller" ? "abc-trading" : "creator@email.com"} />
          </label>
          <label className="tap-label">
            Password
            <input className="tap-input" name="password" required type="password" autoComplete="current-password" placeholder="Password" />
          </label>
          <button className="tap-button tap-button-primary min-h-12 w-full" type="submit">
            Sign In
          </button>
        </form>
      </section>
    </main>
  );
}
