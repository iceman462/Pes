# BIGGEST EMPIRE LIVE

This is the live, backend-enabled edition of the BIGGEST EMPIRE website.

## What it adds
- Animated football-style live wallpaper video
- Admin login with the configured default password `EMPIRE0550`
- Admin publishing of announcements with real image and video uploads
- Persistent post feed stored in `data/posts.json`
- Live polling so new posts appear without a manual page refresh
- Admin deletion of posts
- Admin wallpaper replacement
- WhatsApp group invite storage and Join button
- 50 MiB AI-memory/knowledge-store file at `data/ai-memory.jsonl`
- PWA service worker and manifest
- Mobile responsive UI

## Run

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

## Important

HTML alone cannot receive/publish files to a shared website. The included Node/Express backend handles uploads and persistence.

A website also cannot create a WhatsApp group directly using ordinary browser HTML. Create the group in WhatsApp, then paste its invite URL into the Admin panel.

The 50 MiB memory file is a structured knowledge/memory store for a future AI retrieval layer. It is **not a 50 MiB AI model** and does not by itself make the website equivalent to ChatGPT. A real generative AI service/model must be connected for free-form AI generation.

For production, change `ADMIN_PASSWORD` to a strong secret in the hosting environment and use HTTPS.
