# Fourth Year Timetable

An installable, offline-capable timetable app for Nangarhar University,
Software Engineering, Fourth Year — 1405 Fall semester.

- Day and Week views
- Tap the ✎ button to edit: add, move, recolor, or delete classes
- Everything is saved on the device (no server, no login)
- Installable to the home screen and works fully offline after the first load

## Deploy on GitHub Pages

1. Create a new GitHub repository (e.g. `timetable`).
2. Upload all the files in this folder to the repo root:
   - `index.html`
   - `manifest.json`
   - `service-worker.js`
   - `icon-192.png`
   - `icon-512.png`
   - `README.md`
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Pick the `main` branch and `/ (root)` folder, then **Save**.
6. GitHub gives you a URL like `https://<your-username>.github.io/timetable/`.
   It can take a minute to go live.

## Install it as an app

- **Android (Chrome):** open the URL, tap the menu (⋮), then **Add to Home screen**.
- **iPhone (Safari):** open the URL, tap the Share icon, then **Add to Home Screen**.
- **Desktop (Chrome/Edge):** open the URL, click the install icon in the address bar.

Once installed, it opens in its own window/icon and keeps working without
internet — the service worker caches the app the first time it loads online.

## Editing the data yourself

All class data lives in one place near the top of `index.html`, inside the
`DEFAULT_WEEK` array in the `<script>` section. Each entry looks like:

```js
{ s: "Research", t: "Teach. Assist. Seerat", k: "c0", start: 0, len: 2 }
```

- `s` — subject name
- `t` — teacher name
- `k` — color key (`c0`–`c6`)
- `start` — index into the `SLOTS` array (0 = 08:00, 1 = 09:00, ...)
- `len` — how many 50-minute slots the class spans

This is only the *default* data shown the first time someone opens the app.
Once a person edits it in the app, their changes are saved in their own
browser's local storage and `DEFAULT_WEEK` is no longer used for them.

## Notes for building this into a bigger app

- The app is a single static page: `index.html`, no build step, no backend.
- `manifest.json` and `service-worker.js` are what make it installable and
  offline-capable (a standard PWA setup).
- If you outgrow local-only storage (e.g. want it to sync across devices),
  swap the `localStorage` calls in `index.html` for calls to a backend of
  your choice (Firebase, etc.) — the rest of the UI can stay as is.
