/* ===================================================================
   SUPABASE CONFIG — fill these two lines in with your own project's
   values (Supabase dashboard → Project Settings → API), then every
   page (blog, library, admin) will connect automatically.
   =================================================================== */
window.SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";   // e.g. https://abcdefgh.supabase.co
window.SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"; // the public "anon" key, never the service_role key

window.supabaseClient = (function () {
  if (!window.SUPABASE_URL || window.SUPABASE_URL.startsWith("YOUR_")) return null;
  if (typeof window.supabase === "undefined") return null;
  return window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
})();
