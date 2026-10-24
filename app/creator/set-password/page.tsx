import { CreatorSetPasswordForm } from "@/components/CreatorSetPasswordForm";

export default function CreatorSetPasswordPage() {
  return (
    <main className="tap-shell grid min-h-[calc(100vh-64px)] place-items-center py-8">
      <section className="tap-card w-full max-w-md p-6">
        <p className="text-sm font-black uppercase text-cyan-700">Creator Portal</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Create your password</h1>
        <p className="mt-2 text-slate-600">Your Creator Portal access is ready. Set a password to finish activating your account.</p>
        <CreatorSetPasswordForm />
      </section>
    </main>
  );
}
