import { loginAction } from "@/app/actions";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; role?: string; message?: string }>;
}) {
  const query = await searchParams;
  const role = query.role === "seller" ? "seller" : "admin";
  const next = query.next || (role === "seller" ? "/seller" : "/admin");

  return (
    <main className="tap-shell grid min-h-[calc(100vh-64px)] place-items-center py-8">
      <section className="tap-card w-full max-w-md p-6">
        <p className="text-sm font-black uppercase text-cyan-700">{role === "seller" ? "Seller Login" : "Admin Login"}</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Sign in to TAP System</h1>
        <p className="mt-2 text-slate-600">
          {role === "seller" ? "Use the login details provided by TAP Admin." : "Use the default TAP admin credentials."}
        </p>
        {query.message ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{query.message}</div>
        ) : null}
        <form action={loginAction} className="mt-5 grid gap-4">
          <input type="hidden" name="role" value={role} />
          <input type="hidden" name="next" value={next} />
          <label className="tap-label">
            {role === "seller" ? "Username" : "Username or Email"}
            <input className="tap-input" name="username" required autoComplete="username" placeholder={role === "seller" ? "abc-trading" : "TAPAdmin"} />
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
