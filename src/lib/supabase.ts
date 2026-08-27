import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Settings } from "../types";
import { SYNCED_KEYS, readJSON, writeJSON } from "./storage";

export class CloudNotConfiguredError extends Error {
  constructor() {
    super("尚未設定雲端同步的 Supabase 網址與 Key");
    this.name = "CloudNotConfiguredError";
  }
}

let cached: { url: string; anonKey: string; clientPromise: Promise<SupabaseClient> } | null = null;

// @supabase/supabase-js is a large dependency that most users (who never
// touch cloud sync) shouldn't have to download as part of the app's initial
// bundle - load it lazily, only once cloud sync is actually configured.
//
// getCurrentUser() and onAuthStateChange() both call this at effectively the
// same time on mount. The cache slot must be claimed synchronously (before
// the first await) so the second concurrent call reuses the same in-flight
// promise instead of racing to create its own client - two separate
// GoTrueClient instances would each keep their own session state, so a
// login through one would never be seen by a listener registered on the
// other, leaving the UI stuck showing "logged out" even after a real login.
export async function getSupabaseClient(settings: Settings): Promise<SupabaseClient | null> {
  const { url, anonKey } = settings.cloudSync;
  if (!url || !anonKey) return null;
  if (!cached || cached.url !== url || cached.anonKey !== anonKey) {
    cached = {
      url,
      anonKey,
      clientPromise: import("@supabase/supabase-js").then(({ createClient }) =>
        createClient(url, anonKey),
      ),
    };
  }
  return cached.clientPromise;
}

async function requireClient(settings: Settings): Promise<SupabaseClient> {
  const client = await getSupabaseClient(settings);
  if (!client) throw new CloudNotConfiguredError();
  return client;
}

export async function signUp(settings: Settings, email: string, password: string) {
  const client = await requireClient(settings);
  const { error } = await client.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signIn(settings: Settings, email: string, password: string) {
  const client = await requireClient(settings);
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut(settings: Settings) {
  const client = await requireClient(settings);
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(settings: Settings): Promise<User | null> {
  const client = await getSupabaseClient(settings);
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user;
}

/** Returns an unsubscribe function once the (lazily loaded) client is ready. */
export async function onAuthStateChange(
  settings: Settings,
  callback: (user: User | null) => void,
): Promise<() => void> {
  const client = await getSupabaseClient(settings);
  if (!client) return () => {};
  const { data } = client.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => data.subscription.unsubscribe();
}

interface AppDataRow {
  key: string;
  value: unknown;
  updated_at: string;
}

/** Push every locally-stored key (except API keys) up as one row per key. */
export async function pushAllToCloud(settings: Settings) {
  const client = await requireClient(settings);
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  const user = userData.user;
  if (!user) throw new Error("尚未登入");

  const rows = SYNCED_KEYS.map((key) => ({
    user_id: user.id,
    key,
    // app_data.value is NOT NULL - a key with nothing stored locally yet
    // must still upsert as an empty array, never an explicit null.
    value: readJSON<unknown>(key, []),
    updated_at: new Date().toISOString(),
  }));
  const { error } = await client.from("app_data").upsert(rows, { onConflict: "user_id,key" });
  if (error) throw error;
}

/** Push a single changed key up to the cloud (used for auto-sync on change). */
export async function pushKeyToCloud(settings: Settings, key: string) {
  if (!SYNCED_KEYS.includes(key)) return;
  const client = await getSupabaseClient(settings);
  if (!client) return;
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return;
  await client.from("app_data").upsert(
    { user_id: user.id, key, value: readJSON<unknown>(key, []), updated_at: new Date().toISOString() },
    { onConflict: "user_id,key" },
  );
}

/** Pull every synced key from the cloud and overwrite local storage with it. */
export async function pullAllFromCloud(settings: Settings) {
  const client = await requireClient(settings);
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("尚未登入");

  const { data, error } = await client.from("app_data").select("key, value, updated_at");
  if (error) throw error;
  for (const row of (data as AppDataRow[] | null) ?? []) {
    if (!SYNCED_KEYS.includes(row.key)) continue;
    writeJSON(row.key, row.value ?? []);
  }
}

export const SUPABASE_SCHEMA_SQL = `create table if not exists app_data (
  user_id uuid references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table app_data enable row level security;

create policy "Users manage their own data"
  on app_data for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);`;
