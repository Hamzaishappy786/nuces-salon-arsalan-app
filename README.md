# NUCES Salon — Arslan's Barber Dashboard App

A mobile Android app for Arslan (the barber at FAST NUCES CFD Campus hostel).  
Built with React + Vite, wrapped in Capacitor, deployed as an APK via GitHub Actions.

---

## What the app does

| Screen | Purpose |
|---|---|
| **Today** | See all today's bookings in real-time. Mark cuts as Done or No Show. Tap phone number to call directly. |
| **Upcoming** | Read-only view of the next 7 days, grouped by date. |
| **Earnings** | Daily / weekly / monthly earnings, today's progress bar, no-show tracker, 7-day chart. |

No login required — Arslan's barber ID is baked in at build time.

---

## One-time Supabase setup

### 1. Add the RLS policy that lets the app update appointment status

In [Supabase SQL Editor](https://supabase.com/dashboard) → **SQL Editor** → paste and run:

```sql
-- Replace the UUID below with Arslan's actual barber_id from the barbers table
create policy "Barber can update appointment status"
on public.appointments for update
using (
  exists (
    select 1 from public.time_slots ts
    where ts.id = appointments.slot_id
    and ts.barber_id = 'a1b2c3d4-0000-0000-0000-000000000001'
  )
);
```

> To find Arslan's barber UUID:
> ```sql
> select id, name from public.barbers;
> ```
> Copy the UUID for Arslan / Arsalan Bhai and paste it above.

### 2. Add GitHub Secrets (one time)

In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://grzqlckvowbegppqvtgl.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |
| `VITE_BARBER_ID` | Arslan's barber UUID from the `barbers` table |

---

## Building the APK (GitHub Actions — no Android Studio needed)

Every push to `main` automatically builds a fresh APK.

### How to get the APK after a build

1. Push code → go to **GitHub repo → Actions tab**
2. Click the latest **"Build Android APK"** run
3. Wait ~5–8 minutes for it to complete ✅
4. Scroll to **Artifacts** → click **nuces-salon-arslan** → downloads a `.zip`
5. Unzip → you have `app-debug.apk`
6. Send to Arslan over WhatsApp

### Trigger a build without pushing code

GitHub repo → **Actions → Build Android APK → Run workflow → Run workflow**

---

## How Arslan installs the APK (do this once)

Send him these steps:

1. **Allow unknown sources** (one-time):  
   Settings → Apps → Special app access → Install unknown apps  
   → tap **Chrome** (or Files app) → toggle **Allow from this source**

2. Open WhatsApp → tap the `.apk` file → tap **Install**

3. Tap **Open** — the app is ready

When you send an update later, Android will show **"Update"** instead of Install. Same steps.

> The APK is a debug build — perfectly fine for personal/internal use. No Play Store needed.

---

## Running locally (for development)

```bash
# 1. Clone / enter the project
cd arsalan-salon

# 2. Install deps
npm install

# 3. Copy env file and fill in values
cp .env.example .env
# Edit .env: add your Supabase URL, anon key, and VITE_BARBER_ID

# 4. Start dev server (opens in browser — use mobile viewport in DevTools)
npm run dev
```

The app runs in any browser during development. Use Chrome DevTools → Toggle Device Toolbar → set to a phone viewport (e.g. 390×844).

---

## Whenever you update the app

```bash
git add .
git commit -m "update: describe what changed"
git push origin main
```

→ GitHub Actions builds a new APK automatically  
→ Download from Actions tab → send to Arslan on WhatsApp  
→ He taps Install (or Update)

---

## Tech stack

- **React 18 + Vite** — UI
- **Tailwind CSS** — styling (mobile-first, no hover states)
- **Capacitor 6** — wraps the web app into a native Android APK
- **Supabase JS v2** — same backend as the main student booking app
- **React Router v6 with HashRouter** — required for Capacitor webview

---

## Notes

- **Needs internet** — Supabase calls require WiFi or mobile data. Static assets (HTML/CSS/JS) are bundled in the APK and work offline.
- **Realtime** — new bookings appear automatically via Supabase Realtime. A red banner shows if the connection drops.
- **Price** — haircut price (Rs. 100) is set in `src/lib/supabase.js` as `HAIRCUT_PRICE`. Change and rebuild to update.
- **Barber names** — if the seed used "Ustad Amjad" / "Bilal Bhai", update them in Supabase with the real names before sending the app to Arslan.
