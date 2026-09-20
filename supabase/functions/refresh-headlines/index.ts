// Supabase Edge Function: refresh-headlines
//
// Fetches Philippine education-related headlines from Google News RSS
// (no API key needed) and inserts any new ones into the `headlines` table.
// Meant to be invoked on a schedule (see ../../../supabase-cron-setup.sql).
//
// Deploy this from the Supabase dashboard: Edge Functions → Create a new
// function → name it "refresh-headlines" → paste this file's contents.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically by
// Supabase at runtime — you do not need to set them yourself.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FEED_URL =
  "https://news.google.com/rss/search?q=DepEd%20OR%20%22Philippine%20education%22%20OR%20%22Philippines%20education%22&hl=en-PH&gl=PH&ceid=PH:en";

const MAX_ITEMS_PER_RUN = 15; // how many feed items to look at each run
const MAX_HEADLINES_KEPT = 30; // trims the table so it doesn't grow forever

function extract(pattern: RegExp, text: string): string {
  const m = text.match(pattern);
  return m ? m[1].trim() : "";
}

function cleanTitle(rawTitle: string, source: string): string {
  let t = rawTitle.replace("<![CDATA[", "").replace("]]>", "").trim();
  if (source) {
    const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    t = t.replace(new RegExp(`\\s*-\\s*${escaped}$`), "");
  }
  return t;
}

Deno.serve(async (_req: Request) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
    const xml = await res.text();

    const itemBlocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .map((m) => m[1])
      .slice(0, MAX_ITEMS_PER_RUN);

    let added = 0;
    let skipped = 0;

    for (const block of itemBlocks) {
      const rawTitle = extract(/<title>([\s\S]*?)<\/title>/, block);
      const link = extract(/<link>([\s\S]*?)<\/link>/, block);
      const pubDate = extract(/<pubDate>([\s\S]*?)<\/pubDate>/, block);
      const source =
        extract(/<source url="[^"]*">([\s\S]*?)<\/source>/, block) ||
        "Google News";

      if (!rawTitle || !link) { skipped++; continue; }
      const title = cleanTitle(rawTitle, source);

      // Skip if we already have this exact link.
      const { data: existing } = await sb
        .from("headlines")
        .select("id")
        .eq("source_url", link)
        .maybeSingle();
      if (existing) { skipped++; continue; }

      const publishedDate = pubDate
        ? new Date(pubDate).toLocaleDateString("en-PH", {
            year: "numeric",
            month: "long",
          })
        : null;

      const { error } = await sb.from("headlines").insert({
        title,
        source_label: source,
        source_url: link,
        published_date: publishedDate,
        sort_order: 0,
      });
      if (error) { skipped++; continue; }
      added++;
    }

    // Keep only the most recent MAX_HEADLINES_KEPT rows so the list
    // doesn't grow forever.
    const { data: all } = await sb
      .from("headlines")
      .select("id")
      .order("created_at", { ascending: false });
    if (all && all.length > MAX_HEADLINES_KEPT) {
      const idsToRemove = all.slice(MAX_HEADLINES_KEPT).map((r: { id: string }) => r.id);
      await sb.from("headlines").delete().in("id", idsToRemove);
    }

    return new Response(
      JSON.stringify({ ok: true, added, skipped, checked: itemBlocks.length }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
