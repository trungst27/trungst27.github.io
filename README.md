# Teung’s Space

[Live website](https://trungxsth.id.vn/) · [GitHub @trungst27](https://github.com/trungst27)

I'm **Teung**, a third-year Economics student. This is my personal corner of the internet: a profile, live Discord presence and a curated music library, with room for a future learning portfolio.

## The listening space

- Night Desk layout: Panda profile, original Discord avatar and decoration, social links, and eight AI tool logos.
- After Hours Home keeps the open room scene, biography and Discord/tools. A compact glass player sits in the bottom-right corner, around a quarter of desktop width. Its Library button opens the searchable collection above it; there is no separate Music tab.
- The player’s droplet button toggles glass and remembers the choice locally. Its initial state follows the system’s reduced-transparency preference.
- Motion: the inline vinyl rotates only during real playback, with restrained transport/favorite feedback. The header motion button remembers an explicit on/off choice; the default follows reduced motion. Hidden tabs stop ambient loops and active animations.
- Vinyl Portal intro: a rotating record opens through its centre into the room, followed by the live profile and player. Replay in the header enables site motion explicitly; Skip intro or Escape ends it immediately. It never changes audio playback. Implementation: `assets/js/vinyl-intro.js`, SVG geometry and native Web Animations; no added dependency.
- Living room background: moving rain on the window, vapour above the noodle bowl, and a soft lamp glow in `assets/js/room-ambience.js`. Canvas material follows the existing image crop on desktop and mobile. It runs with music paused, follows the shared motion preference, and stops in hidden tabs and when the scene leaves the viewport. The original image is the fallback; no video download or extra library is needed.
- Local MP3s and official SoundCloud players in one library.
- Search (including Vietnamese without accents), mood filters, browser-local favorites and a play queue.
- Shared playback controls: play/pause, previous/next, seek, shuffle, repeat and remembered volume (50% on first visit).
- `#music` and `#library` links open the collection on Home without resetting playback. Escape closes it and restores focus. Space toggles playback outside form controls.
- Responsive player and library, background-video pause, reduced-motion support and keyboard focus styles.
- Live Discord name, presence and activities through Lanyard.

The initial collection uses the two MP3s already in this repository and the two supplied SoundCloud links. Local track titles come from filenames; SoundCloud metadata comes from its official oEmbed/widget. No mood tags have been assigned yet; add them in Admin after setup.

## Library Manager

Open `/admin.html` to preview audio files or SoundCloud links. After connecting Supabase, authorized administrators can upload files and covers, save drafts, publish, edit, reorder and hide tracks.

**Cloud configuration is currently empty.** Saving and publishing are disabled until setup is complete. Public listening works from the bundled collection meanwhile.

Follow [the Supabase setup guide](docs/SUPABASE_SETUP.md). It covers Auth, database/storage policies, the admin account and public configuration. No API key is required for SoundCloud embeds. SoundCloud account synchronization through OAuth is outside this version.

## Run locally

From the folder containing `index.html`:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open [the listening space](http://127.0.0.1:8000/) or [Library Manager](http://127.0.0.1:8000/admin.html). No package installation or build step is required. External fonts, Font Awesome, Discord and SoundCloud need internet access.

## Project guide

| File | Purpose |
| --- | --- |
| `index.html`, `styles.css` | Profile, library, player and responsive Night Desk appearance |
| `assets/css/home-player.css` | Compact corner vinyl player, glass treatment and expandable collection |
| `assets/data/tracks.json` | Bundled collection and fallback if cloud reads fail |
| `assets/js/config.js` | Public Supabase URL and publishable key; never secrets |
| `assets/js/library-data.js` | Data requests, safe URLs, local storage and artwork fallbacks |
| `assets/js/music.js` | Single-source playback controller for audio and SoundCloud |
| `assets/js/library.js` | Search, filters, favorites, queue and player UI |
| `assets/js/script.js` | Entry screen, same-page anchors, glass and motion preferences |
| `assets/js/audio-visualizer.js` | Subtle avatar-border response to local audio |
| `admin.html`, `assets/css/admin.css`, `assets/js/admin.js` | Login, editor, previews, uploads and publishing |
| `supabase/schema.sql` | Music tables, authorization, ordering RPC and storage policies |
| `docs/SUPABASE_SETUP.md` | Backend setup instructions |
| `assets/js/lanyard.js`, `assets/js/discord.js` | Live Discord presence and avatar decoration |
| `PRODUCT.md`, `DESIGN.md` | Product scope and visual system |
| `assets/music/`, `assets/back/`, `assets/pfp/` | Existing audio, anime video and original Discord photo |
| `Po-Kung-Fu-Panda-Eating-Noodles.webp` | Main Panda avatar |
| `assets/scenes/` | Compressed After Hours scene and generation provenance |
| `CNAME` | GitHub Pages custom domain |

Older title/typewriter, tilt and Neko source files remain in the repository but are not loaded by the Night Desk interface. CSS and JS query versions in HTML should be bumped when publishing updates.

## Discord

The account ID is set on `.discord-widget` in `index.html`. The account must be in the [official Lanyard server](https://discord.gg/lanyard). The client uses WebSocket updates, reconnects, and falls back to REST polling. Connection failures display **Unavailable** separately from **Offline**.

## Hosting

The frontend is compatible with GitHub Pages on `main`, with the domain in `CNAME`. Supabase provides persistent admin/data/storage features separately. Pushing to the Pages source branch triggers deployment; local edits alone do not publish them.

## License and assets

See [LICENSE](LICENSE) for MIT copyright notices. AI logo sources are recorded in [assets/logo/ai/README.md](assets/logo/ai/README.md). Fonts are served by Google Fonts, icons by Font Awesome, presence by Lanyard, and external music by SoundCloud's official player.
