const SUPABASE_URL =
  "https://jeeuayoejozljsjrjtel.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_zrisa5NAiqdqhAVuJMwHJw_ntoFKYKW";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

window.supabaseClient = supabaseClient;
