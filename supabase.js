import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://xhtnidoouiaolljkqsus.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodG5pZG9vdWlhb2xsamtxc3VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MzA2NTQsImV4cCI6MjEwMzMwNjY1NH0.byn6AJ7zpuZAxtPT2TCfWDeqBqORaXJ1OHm8JZUuGhk";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
