import { NextResponse } from "next/server";

import { ensureDefaultAdminUser, loginIdentifierToEmail, userHasRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  if (process.env.AUTH_DIAGNOSTIC_ENABLED !== "1") {
    return NextResponse.json({ ok: false, error: "disabled" }, { status: 404 });
  }

  const steps: Record<string, unknown> = {};

  try {
    const email = loginIdentifierToEmail("admin", "TAPAdmin");
    steps.emailMapped = email === "tapadmin@iplast.ai";
    steps.hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
    steps.hasAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    steps.hasService = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

    const user = await ensureDefaultAdminUser();
    steps.bootstrapUser = Boolean(user?.id);

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: "iPlastTAP123!"
    });
    steps.signInUser = Boolean(data.user);
    steps.signInSession = Boolean(data.session);
    steps.signInError = error?.message || null;
    steps.roleOk = data.user ? await userHasRole(data.user.id, "admin") : false;

    return NextResponse.json({ ok: true, steps });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        steps,
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
