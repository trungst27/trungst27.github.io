# Home — After Hours

Mode: Experience with embedded listening controls. Existing factual profile, social links, live Discord and agent logos accompany an inline vinyl deck and collection on one Home. Historical reviews below describe prior iterations.

## Current contract — compact corner player, 2026-11-14

The owner clarified that Home should retain its previous open-room composition. Music is a small now-playing widget at the lower right, around a quarter of desktop width, rather than a permanent inline workspace. Restore profile/scene hierarchy; show Library on demand above the compact glass deck. Keep vinyl rotation driven by real playback, all existing IDs/engine bindings, saved preferences and the official SoundCloud mount. Queue and Library are mutually exclusive panels. Escape restores the appropriate trigger. No new dependencies, commit, push or deployment.

Manual render and interaction review: native 1001px desktop, 1273 × 716 wrapper and 390 × 844 phone. Compact player, open library, no-accent search and Escape focus restoration observed. The header replay width was corrected at intermediate sizes. Phone panels stay inside the frame. Review artifacts belong to the ignored review folder; this verdict supersedes the inline deck's layout verdict below.

## Superseded iteration — inline Home deck, 2026-11-14

The owner requested a spinning record and music selection directly on Home, removing the separate Music tab and bottom bar. Desktop places biography and connections left, with one glass listening surface right. That surface contains vinyl/transport, optional in-flow queue and collection. Phone source order is profile, deck, collection, Discord/tools. All existing player IDs, the single-source engine and official SoundCloud mount remain. Legacy #music links scroll to the embedded collection. Replay moves into the header.

Manual rendered review covers native 1273 × 716, 868px intermediate, 390 × 844 phone and 280px narrow phone. The scoped body minimum was removed to avoid scrollbar-width overflow at 280px. Profile contrast over the mobile banner was strengthened. Local playback visibly rotates the record; pause stops it. Selecting the supplied 3in1 SoundCloud track loads the official widget, advances elapsed time and runs the same record animation. Search `kho ve` finds the accented local title. Queue opens in flow and Escape restores trigger focus. Volume remained 9%; no preference reset.

Independent source and native screenshot review: ship, with the root's mobile checks completed afterward. Layout detector before edits had no findings; the final scan flags only Discord's flush right edge. This is an accepted narrow exception: the flat section has a top separator, no right border or enclosing card, and aligns with the biography edge. No padding change is required.

Evidence: ignored review/home-deck-desktop.png and review/home-deck-mobile.png, the latter showing the scrolled phone deck and collection within an external wrapper. Runtime changes: index.html, assets/css/home-player.css, assets/js/script.js and assets/js/vinyl-intro.js. README, PRODUCT, DESIGN and design sidecar updated. No new dependencies, automated tests, commit, push or deployment. Preview: /?preview=1&v=home-deck-3#home.

## Direction contract

THESIS: Teung’s nighttime listening desk. The profile belongs to a personal room with a rainy window, warm lamp, vinyl player and a noodle bowl recalling the Panda portrait.

OWN-WORLD: Preserve Night Desk’s forest charcoal, ivory Lora and olive controls. Add warm amber only in the authored scene. Live text and controls sit above the image; the main Panda and Discord photo remain distinct.

STORY: Recognize Teung, see the supplied education and social links, enter the collection, and keep listening across routes.

FIRST VIEWPORT: Full-width room backdrop with coherent bio and primary action on the left, the desk scene on the right, live Discord and eight logos in a lower strip. Player is translucent dark glass with opaque readable controls. Mobile has a scene banner, then the same profile and supporting strip in reading order.

FORM: seed: none (pinned). User approved the generated After Hours mockup with “ok đó” and requested a transparent music bar. The approved image is the visual reference; the new glass treatment is their explicit revision. No extra personal claims or account features.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Delivery

No new runtime library. Scene-only image generated from the approved mockup, compressed with built-in Windows image encoders. Video pauses on Home. Ambient motion pauses in hidden tabs and respects reduced motion. Glass has an opaque fallback and reduced-transparency treatment. Preview stays local; no commit, push or deploy.

## Review state

Browser access restored. Glass is an explicit per-browser choice via the droplet button; its saved preference was enabled and retained after reload even when the system requested reduced transparency. The supported glass treatment was confirmed via rendered preview and computed backdrop styles. The unsupported-backdrop fallback remains opaque.

Approved visual reference: Imagegen output `exec-a4183044-dba8-44a5-9d58-bc82a4b2d4a6.png`, retained in the conversation’s local generated-images folder. Current review evidence: `.impeccable/review/desktop.png` (1440 × 1000 app viewport), `mobile.png` (390 × 844 app viewport), and `glass-after.jpg` (actual short desktop viewport). Responsive captures include a clearly external preview label/wrapper.

Independent finish review: ship. Both material findings were resolved: at 1273 × 716 the complete Discord/tools strip ends at approximately 573px, above the player at 590px, as captured in `.impeccable/review/glass-short-fixed.jpg`; DESIGN.md and its sidecar record the implemented Home and saved glass preference. Review accepted the room material, live typography, mobile composition and transparent-player adaptation. Server returns HTTP 200 on port 8000. Supabase remains unconfigured and is outside this review.

## Motion refinement — 2026-11-14

Requested after adding the Framer connector. Its accessible project and capability documentation were read; that connector edits Framer-hosted projects, while this website remains the existing vanilla repository. No Framer project was changed or published.

Focal motion: the room light settles over 760ms without moving the biography. Continuity: Music arrives in 320ms and the queue opens toward the transport in 280ms, closing in 140ms; playback remains mounted. Feedback: active navigation, transport icons and saving favorites receive short bounded responses. Budget: one brief scene filter on arrival; no pointer tracking, continuous blur animation or new runtime dependency. Repeated actions replace the previous animation and hidden tabs cancel sequences. Motion defaults to the system preference; the header exposes a persisted explicit site override.

Source review completed for this refinement. The previous independent ship verdict and screenshots above cover the earlier layout/glass version only. Current visual/interaction review is pending: browser security rejected binding the old error-page tab because it uses a disallowed URL protocol. The user reported opening the new preview, but the connected browser inventory still exposes the old error tabs. Do not treat earlier captures as evidence for the new animation behavior.

## Vinyl Portal — approved and implemented

The user selected Vinyl Portal from three proposed directions: a rotating record opens through its centre into the room, with coordinated profile and player arrival. Native SVG geometry and Web Animations preserve the vanilla repository. Framer's interaction documentation and the accessible blank project were inspected; no Framer project was modified or published.

The finite sequence lasts 2400ms. Replay is next to the collection action (icon only on compact viewports) and explicitly enables site motion. Fresh entries respect the existing saved/system preference. Skip intro, Escape, resizing, hiding the tab, turning motion off, and navigating to Music restore normal live CSS immediately. Skipping by keyboard restores focus to Replay. The intro owns no audio calls and does not change the current song or volume.

Browser access recovered through the user's live HTTP preview. Manual rendered review completed at the native 868px viewport, 1273 × 716 desktop, and 390 × 844 phone viewport. Opening and finished frames were inspected, including the expanding aperture, absence of an end flash, Skip/Escape focus restoration, explicit motion opt-in from Replay, and Home/Music navigation. The paused SENA selection and 9% volume were retained. At the short desktop the Discord strip ends at 572.66px with the player at 590px; no horizontal overflow was observed in the reviewed layouts. No intro errors were captured. A later Home/Music route pass logged a zero-size canvas error from SoundCloud's third-party widget script; the intro itself uses SVG and does not call canvas or audio APIs. SoundCloud playback while the intro runs was not exercised in this pass.

Evidence in ignored `.impeccable/review/`: `vinyl-portal-opening.png`, `vinyl-portal-home.png`, `vinyl-portal-short.png`, `vinyl-portal-mobile.png`. Responsive screenshots include the external wrapper. Verdict for this motion refinement: ready for the owner's preview. No automated tests or new dependencies; no commit, push or deploy.

## Living room background — 2026-11-14

The owner requested continuous movement after approving the portal. Keep the authored room plate and add animated material in its own coordinates: rain only in clear glass regions, vapour from the noodle bowl and a local warm lamp glow. The former whole-image opacity pulse is removed. A single transparent canvas stays below the existing contrast gradients and inherits the desktop/mobile crop, including the 330px phone banner. Rendering is bounded in pixel density, with fewer particles and a lower frame target on phones. The static image is the fallback. Ambient movement does not depend on playing music.

Manual review: native 868 × 836 desktop and 390 × 844 phone iframe. Rain and vapour visibly move after the intro with Halee selected and paused. Canvas state was confirmed running on Home and paused by the header control and the Music route. Enabling motion resumes the room and preserves the approved intro. Phone crop aligns the vapour with the bowl. The mobile page still showed part of the scene after End, so offscreen suspension is implemented via IntersectionObserver but was not directly exercised in that scroll pass. No errors were captured in the reviewed room page; no automated tests or new dependencies were used.

Evidence: `.impeccable/review/living-room-demo.gif` is a looping recording of 48 actual browser screenshots over approximately 2.6 seconds, encoded with the built-in Windows WPF GIF encoder. It is an ignored review artifact, not the background delivered to visitors. `living-room-mobile.png` records the phone composition inside the external wrapper. Runtime implementation is `assets/js/room-ambience.js`, with mounting/caching in `index.html` and canvas placement in `styles.css`. Preview retained at `/?preview=1&v=living-room-2#home`. No commit, push or deploy.
