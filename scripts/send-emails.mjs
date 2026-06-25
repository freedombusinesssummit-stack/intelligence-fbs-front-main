#!/usr/bin/env node
/**
 * Send registration emails for existing partners.
 *
 * Usage:
 *   node scripts/send-emails.mjs "Sandra Jardim Fernandes" "Francisco Lourenco" "Minwon Cho"
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Load .env.local ──────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');

const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    }),
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY;
const RAILWAY_URL  = 'https://intelligence-fbs-production-2b6f.up.railway.app/api/email/registration';

if (!SERVICE_KEY) {
  console.error('\n❌  SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  console.error('   Add it from: Supabase Dashboard → Project Settings → API → service_role\n');
  process.exit(1);
}

// ── Supabase admin client ────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Main ─────────────────────────────────────────────────────────────────────
const names = process.argv.slice(2);

if (!names.length) {
  console.error('\nUsage: node scripts/send-emails.mjs "Full Name 1" "Full Name 2"\n');
  process.exit(1);
}

console.log(`\n🔍  Looking up ${names.length} partner(s)...\n`);

for (const name of names) {
  console.log(`── ${name}`);

  // 1. Find partner profile by full_name (case-insensitive)
  const { data: profiles, error: profileErr } = await supabase
    .from('partner_profiles')
    .select('*')
    .ilike('full_name', `%${name}%`);

  if (profileErr) {
    console.error(`   ❌  DB error: ${profileErr.message}`);
    continue;
  }

  if (!profiles || profiles.length === 0) {
    console.warn(`   ⚠️   No partner_profile found for "${name}" — skipping`);
    continue;
  }

  if (profiles.length > 1) {
    console.warn(`   ⚠️   Multiple profiles matched "${name}", using first result: ${profiles[0].full_name}`);
  }

  const profile = profiles[0];

  // 2. Get email from auth.users via admin API
  const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(profile.id);

  if (userErr || !userData?.user) {
    console.error(`   ❌  Could not fetch auth user: ${userErr?.message ?? 'user not found'}`);
    continue;
  }

  const email = userData.user.email;

  // 3. Build payload — same shape as the registration form sends
  const payload = {
    email,
    name:          profile.full_name,
    company:       profile.company_name,
    website:       profile.website,
    role:          profile.role,
    country:       profile.country,
    bio:           profile.bio,
    services:      profile.services      ?? [],
    jurisdictions: profile.jurisdictions ?? [],
    plan:          profile.plan,
  };

  console.log(`   📧  Sending to ${email} …`);

  // 4. POST to Railway email API
  try {
    const res = await fetch(RAILWAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    if (res.ok) {
      console.log(`   ✅  Sent (${res.status})`);
    } else {
      console.error(`   ❌  API returned ${res.status}: ${text}`);
    }
  } catch (err) {
    console.error(`   ❌  Network error: ${err.message}`);
  }
}

console.log('\nDone.\n');
