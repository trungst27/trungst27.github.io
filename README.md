# Teung | Personal Website

[Visit my website](https://trungxsth.id.vn/) · [GitHub @trungst27](https://github.com/trungst27)

I'm **Teung**, a third-year Economics student. This repository contains my personal website: a place for my profile, social links, and live Discord presence.

The current site is a personal bio page, with room to grow into a learning portfolio for future coursework and projects.

## Features

- An animated terminal introduction with typewriter text.
- A profile card with a translucent background, social links, and eight AI tool and agent logos.
- A looping video background and background music, set to **50% volume** by default. Music starts after user interaction.
- A Po profile avatar, plus live Discord display name, status, and shared activities in a separate widget with the original photo and Discord avatar decoration.
- Hover tilt, a glow that responds to audio, and Neko cat animations.
- Responsive styling for desktop and smaller screens.

## Technology

| Area | Technology |
| --- | --- |
| Page structure | HTML |
| Styling and layout | CSS |
| Interactions and effects | Vanilla JavaScript |
| Live Discord presence | Lanyard REST API and WebSocket |
| Hosting | GitHub Pages |
| Custom domain | `trungxsth.id.vn` |

## Run locally

From the repository folder containing `index.html`, start a static server with Python 3:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open [http://127.0.0.1:8000/](http://127.0.0.1:8000/). After the introduction finishes, press **Enter** or click the terminal to reveal the profile.

The website requires no package installation or build step. External fonts, Font Awesome icons, and live Discord data require an internet connection.

## Project guide

| File or folder | Purpose |
| --- | --- |
| [`index.html`](index.html) | Profile text, social links, AI logos, Discord ID, and asset references |
| [`styles.css`](styles.css) | Main layout, widget appearance, and responsive styling |
| [`assets/js/script.js`](assets/js/script.js) | Terminal introduction and transition into the profile |
| [`assets/js/username-animation.js`](assets/js/username-animation.js) | Animated display-name variants |
| [`assets/js/title.js`](assets/js/title.js) | Animated browser tab title |
| [`assets/js/music.js`](assets/js/music.js) | Playlist, playback, and default volume |
| [`assets/js/audio-visualizer.js`](assets/js/audio-visualizer.js) | Profile glow driven by audio |
| [`assets/js/lanyard.js`](assets/js/lanyard.js) | Live Discord name, status, activities, and reconnection handling |
| [`assets/js/discord.js`](assets/js/discord.js) | Discord avatar-decoration lookup |
| [`assets/js/tilt-effect.js`](assets/js/tilt-effect.js) and [`assets/css/tilt-effect.css`](assets/css/tilt-effect.css) | Profile card tilt effect |
| [`assets/js/neko.js`](assets/js/neko.js) and [`assets/js/neko-init.js`](assets/js/neko-init.js) | Neko cat animations |
| [`assets/pfp/`](assets/pfp/) | Profile images; `default.png` is used by the Discord widget |
| [`assets/back/`](assets/back/) | Background video |
| [`assets/music/`](assets/music/) | Background audio files |
| [`assets/logo/ai/`](assets/logo/ai/) | AI logo assets and their source notes |
| [`Po-Kung-Fu-Panda-Eating-Noodles.webp`](Po-Kung-Fu-Panda-Eating-Noodles.webp) | Main profile avatar |
| [`CNAME`](CNAME) | GitHub Pages custom-domain setting |

When changing a CSS or JavaScript file that has a `?v=...` value in `index.html`, update that value so browsers load the new version.

## Live Discord widget

The account ID is configured with `data-discord-user-id` on `.discord-widget` in `index.html`.

To receive live presence, the configured account must join the [official Lanyard server](https://discord.gg/lanyard). [Lanyard](https://github.com/Phineas/lanyard) exposes the account's presence and shared activities through its public API; reading this data requires no API key.

The widget receives WebSocket updates and reconnects after interruptions. While live updates are unavailable, it checks the REST API every 30 seconds. A connection failure displays **Unavailable**, separately from Discord's **Offline** status.

The main profile uses a local Po image. The Discord widget uses the original photo (`assets/pfp/default.png`) with the account's avatar decoration, while the display name, status, and activities update from Discord.

## Deployment

The site is published through GitHub Pages from `main`, using the domain configured in [`CNAME`](CNAME). Pushing updates to `main` starts the repository's Pages deployment.

Live website: **[trungxsth.id.vn](https://trungxsth.id.vn/)**

## License and assets

See [`LICENSE`](LICENSE) for the project's MIT license and copyright notices.

AI logo sources and their licensing notes are documented in [`assets/logo/ai/README.md`](assets/logo/ai/README.md). Other external resources used by the page include Google Fonts, Font Awesome, and Lanyard.
