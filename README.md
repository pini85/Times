# זמני תפילות

Prayer times board for the synagogue.

- `/` – the board (phone or big screen). Refreshes the times every minute.
- `/login` → `/admin` – build the board: add/remove/reorder banners and rows,
  set boxes per row, edit each box's name and time, then **Publish**.
  Save the board as a named **template** (e.g. summer, winter, holiday) and load it later. Add `?debug` to `/` to outline the boxes and banners.
- `/demo` – the board pieces in other arrangements (2 per row, 4 per row, extra banners).

## Setup

1. Copy `.env.example` to `.env.local` and fill it in:
   - `AUTH_SECRET` – run `npx auth secret`
   - `ADMIN_USERS` – `name:password,name2:password2`
   - Upstash Redis URL/token (needed when hosted; locally the board goes to `data/layout.json`
     and templates to `data/templates.json`)
2. `npm install && npm run dev`

## Deploy (Vercel)

Import the repo, add the env vars above, and add Upstash Redis from
Vercel → Storage (it sets the Redis env vars for you).

## Board pieces

The board is built from reusable components in `components/board/`:

```tsx
<BoardFrame>                      {/* arch + title, columns, bottom */}
  <Banner>ימות החול</Banner>      {/* as many as you like, any text */}
  <BoxRow cols={2}>               {/* boxes per row; fewer boxes are centred */}
    <TimeBox label="שחרית" time="06:30" />
    <TimeBox label="מנחה" time="13:45" />
  </BoxRow>
</BoardFrame>
```

What the main board shows is stored data edited at `/admin` (types,
validation and the default board are in `lib/layout.ts`; storage in
`lib/store.ts`). `components/LayoutView.tsx` turns it into board components,
for both the live board and the admin preview. Times saved before the layout
became editable are picked up automatically.

The gold pieces in `public/parts/` are cut from `public/board.png` by
`python3 scripts/extract-parts.py` (needs numpy + Pillow). The corners and
ornaments come from the picture; the straight edges and fills stretch, so
boxes and banners can be any size.
