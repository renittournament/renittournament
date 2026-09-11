const SUPABASE_URL =
  "https://jeeuayoejozljsjrjtel.supabase.co";

const SUPABASE_KEY =
  "তোমার আগের Supabase Publishable Key এখানে বসাও";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );
