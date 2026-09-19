/* ===================================================================
   SUPABASE CONFIG — fill these two lines in with your own project's
   values (Supabase dashboard → Project Settings → API), then every
   page (blog, library, admin) will connect automatically.
   =================================================================== */
window.SUPABASE_URL = "https://cfvwqhhgypzjzjwbepoe.supabase.co";   // e.g. https://abcdefgh.supabase.co
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdndxaGhneXB6anpqd2JlcG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NDMwNzMsImV4cCI6MjEwNTQxOTA3M30.uZq32EuybCpgcVp5Eq6JqbYBzCbKYznq5S23TMAlt7g"; // the public "anon" key, never the service_role key

window.supabaseClient = (function () {
  if (!window.SUPABASE_URL || window.SUPABASE_URL.startsWith("YOUR_")) return null;
  if (typeof window.supabase === "undefined") return null;
  return window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
})();
