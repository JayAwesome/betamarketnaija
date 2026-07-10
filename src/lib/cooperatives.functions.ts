import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const joinSchema = z.object({ code: z.string().trim().min(1).max(64) });

export const joinCooperativeByCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => joinSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = data.code.toUpperCase();

    const { data: coop, error: findErr } = await supabaseAdmin
      .from("cooperatives")
      .select("id, name, join_code")
      .eq("join_code", code)
      .maybeSingle();

    if (findErr) throw new Error(findErr.message);
    if (!coop) throw new Error("Invalid join code");

    const { error: insErr } = await supabaseAdmin
      .from("cooperative_members")
      .upsert(
        { cooperative_id: coop.id, user_id: context.userId },
        { onConflict: "cooperative_id,user_id", ignoreDuplicates: true },
      );
    if (insErr) throw new Error(insErr.message);

    return coop;
  });
