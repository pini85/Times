# זמני תפילות

Prayer times board for the synagogue.

- `/` – the board (phone or big screen). Refreshes the times every minute.
- `/login` → `/admin` – edit the times. Add `?debug` to `/` to outline the slots.

## Setup

1. Copy `.env.example` to `.env.local` and fill it in:
   - `AUTH_SECRET` – run `npx auth secret`
   - `ADMIN_USERS` – `name:password,name2:password2`
   - Upstash Redis URL/token (needed when hosted; locally times go to `data/times.json`)
2. `npm install && npm run dev`

## Deploy (Vercel)

Import the repo, add the env vars above, and add Upstash Redis from
Vercel → Storage (it sets the Redis env vars for you).

Slot positions are in `app/globals.css` (`.r1–.r3`, `.right/.middle/.left`);
slot names are in `lib/slots.ts`.
