---
name: "Teung’s Space — Night Desk"
description: "A calm personal listening space in forest, charcoal, ivory and olive."
colors:
  bg: "#171b17"
  panel: "#1b201c"
  surface: "#242a24"
  ink: "#f2efe5"
  muted: "#b4b9ad"
  accent: "#c3d19e"
  accent-ink: "#202719"
  line: "#3e473a"
  danger: "#f1b3a5"
  player-surface: "#20271f"
  player-border: "#677456"
  player-glass: "rgba(18,25,20,.1)"
typography:
  display:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(33px, 3.5vw, 48px)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "25px"
    fontWeight: 500
    lineHeight: 1.2
  title:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.6
rounded:
  artwork: "6px"
  control: "7px"
  notice: "8px"
  current: "9px"
  panel: "12px"
  glass: "16px"
  shell: "16px"
  pill: "30px"
  circle: "50%"
spacing:
  "7": "7px"
  "10": "10px"
  "14": "14px"
  "20": "20px"
  "25": "25px"
  "38": "38px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.control}"
    padding: "11px 22px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 22px"
  search-field:
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
  navigation-link:
    textColor: "{colors.muted}"
    padding: "25px 0"
  mood-chip:
    textColor: "#e0e5d6"
    rounded: "{rounded.pill}"
    padding: "7px 19px"
  mood-chip-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.pill}"
    padding: "7px 19px"
  setup-panel:
    backgroundColor: "#252e21"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "25px"
  track-row:
    textColor: "{colors.ink}"
    padding: "11px 10px"
  track-row-current:
    backgroundColor: "#333f2b"
    textColor: "{colors.ink}"
    rounded: "{rounded.current}"
    padding: "11px 10px"
  player:
    backgroundColor: "rgba(15,25,19,.42)"
    textColor: "{colors.ink}"
    rounded: "{rounded.glass}"
    padding: "16px"
  listening-room:
    backgroundColor: "rgba(15,25,19,.38)"
    textColor: "{colors.ink}"
    rounded: "{rounded.glass}"
    padding: "26px"
---

# Design System: Teung’s Space — Night Desk

## Overview

**Creative North Star: "Night Desk"**

Night Desk is Teung’s calm listening space: forest and charcoal surfaces, ivory serif headings, and muted olive controls. The Panda profile gives the space a recognizable personal identity. The original photo and decoration remain part of the live Discord identity.

The interface combines a compact collection of controls with a clear vertical music library. Lora carries names, headings and song titles; DM Sans keeps navigation, labels and playback controls easy to scan. Thin borders and nearby forest tones define the surfaces, with the biography on Home and music available in a compact corner player.

**Key Characteristics:**

- Forest and charcoal surfaces with ivory text.
- Muted olive for primary actions and selected controls.
- Lora headings and track titles with DM Sans controls.
- Personal Panda identity and a distinct live Discord presence.
- A vertical library, compact phone layout and inline vinyl transport.

This reference records the implementation on 2026-11-14. The source values live in [styles.css](styles.css), the scoped Home overrides in [assets/css/home-player.css](assets/css/home-player.css), and [assets/css/admin.css](assets/css/admin.css); the product direction is recorded in [PRODUCT.md](PRODUCT.md). Frontmatter values are the implemented tokens. The sidecar’s tonal ramps are derived preview ramps, rather than additional implemented colors.

## Colors

The palette sits close to forest charcoal, with warm ivory text and a pale olive accent. Repeated source colors are recorded in the frontmatter; source-specific badges and feedback keep their existing local colors.

### Primary

- **Muted Olive — accent:** Filled entry, sign-in and publish actions; selected mood filters; play controls; focus outlines; range controls.
- **Deep Olive Ink — accent-ink:** Dark text and icons on olive fills.

### Neutral

- **Forest Charcoal — bg:** Page background and the dark foundation behind the video.
- **Dark Forest Panel — panel:** Supporting dark surfaces, scrollbar track and the outline around presence dots.
- **Forest Surface — surface:** Secondary button fill.
- **Warm Ivory — ink:** Main headings and readable primary text.
- **Sage Gray — muted:** Secondary copy, metadata and inactive navigation.
- **Moss Line — line:** Structural borders, dividers and sidebar separation.
- **Player Forest — player-surface:** Queue, administrator input fill and opaque player fallback.
- **Player Moss — player-border:** Queue boundary.
- **Player Glass — player-glass:** Translucent shared transport, with fully opaque text and controls.

The danger token is a warm peach available in the shared palette. The current error notice uses its own peach text and warm border. Discord presence retains its semantic online, idle, busy and offline colors; SoundCloud retains its warm brown and peach source treatment.

**The Olive State Rule.** Use olive fill for the existing primary actions and selected controls. A current track uses a darker forest highlight, preserving the distinction between playback position and a filled action.

## Typography

**Display Font:** Lora, with Georgia and serif fallbacks.  
**Body Font:** DM Sans, with a sans-serif fallback.

The pairing gives the personal space a quiet editorial character while keeping dense controls straightforward. Italic Lora appears in welcome copy, personal notes and the library footer. There is no separate monospace type system.

### Hierarchy

- **Display:** The library welcome uses the responsive frontmatter size and a close letter fit. The entry greeting grows from (32px) to (53px); its tracking is also (-0.03em).
- **Headline:** Library headings use (25px). Profile names use (32px). The administrator title uses (38px), with (-0.025em) tracking.
- **Title:** Track names use Lora at (15px) with a relaxed (1.6) line height. Player titles use (13px).
- **Body:** General copy uses DM Sans at (14px), with a (1.6) line height. Supporting profile copy uses (12–13px).
- **Label:** Search, mood controls, source labels, time labels and supporting copy use (12px). Administrator field labels have medium weight (500); active mood chips use (600).
- **Phone adjustments:** The final mobile welcome is (32px), becoming (30px) at the narrow phone breakpoint. Track titles become (14px), then (13px).

**The Two Type Voices Rule.** Use Lora for the implemented names, headings and track titles; use DM Sans for controls, metadata and form labels.

## Layout

The open After Hours Home is restored: biography and supplied links on the left, authored room scene on the right, Discord and tools below. The compact player is fixed at the bottom right, 24px from the edge and 20px above the bottom. Its desktop width is clamp(300px,26vw,380px), approximately one quarter of the viewport. It does not replace Home with a music workspace.

The glass player contains a 64px rotating vinyl beside two-line metadata and compact transport, followed by seek and volume/library controls. The record becomes 54px below 360px. Current track, queue, volume and single-source playback retain their existing bindings.

Library is an on-demand panel above the player, at most 440px wide and viewport-bounded in height, with scrolling inside. Search, filters and track actions remain available. Escape and the close button dismiss it and restore trigger focus; clicking outside also dismisses it. Queue opens in the same region, mutually exclusive with Library. Legacy #music and #library anchors open the collection instead of switching pages.

### Responsive behavior

Below 1100px the tools strip moves under Discord to stay clear of the player. At 760px the original scenic banner and stacked profile remain. The player is at most 340px wide, inset 12px, with a safe-area bottom offset. The collection matches that width and stays above the dock. Bottom page padding leaves the final profile/footer content reachable while scrolling. At 360px smaller vinyl, gaps and controls keep the dock within the screen. Administrator layout is unchanged.

## Elevation & Depth

Home uses the authored room plate with live rain, noodle vapour and lamp glow from room-ambience.js. The old anime video remains in the repository but stays paused on Home. The canvas follows the plate crop, pauses with shared motion, page visibility and scene intersection, and operates independently of music.

The compact player supplies the glass effect: a light reflective gradient over rgba(15,25,19,.42), 14px backdrop blur, 145% saturation, 16px corners and a soft 0 12px 40px shadow. Text and controls stay opaque. Browsers without backdrop blur use rgba(24,33,26,.98). The droplet stores the user's choice; the initial choice follows reduced transparency.

The record uses radial grooves, a directional reflection, a circular cover label and a spindle. Its 18-second linear rotation runs only when the real music state is playing, site motion is enabled and the tab is active. Pausing preserves the angle. No simulated SoundCloud spectrum is added.

Vinyl Portal remains the finite 2400ms entrance; Replay is in the header, with Skip and Escape support. It does not control audio. Rain and vapour remain the only continuous room movement. The same motion preference governs the record and background. No new runtime dependency is added.

## Shapes

The shell has softened outer corners (16px). The compact player, collection and queue use (16px) corners. The administrator setup retains (12px) corners. Buttons use modest corners (7px), artwork uses (6px), and the current track receives a (9px) highlight. Notice corners are (8px). Search and mood controls use pill corners (30px).

The Panda and Discord avatars are circular, as are transport and icon buttons. Fine borders are generally (1px); keyboard focus uses an olive (2px) outline with a (5px) offset. Search instead outlines its enclosing field with a (2px) offset. Cover imagery is clipped and cropped to fill its square, while logos remain contained.

## Components

### Primary and secondary buttons

Calm, legible actions with a minimum height of (44px), medium DM Sans text (13px), a (13px) icon gap, and compact corners. Primary buttons use olive with dark ink; hover lightens the fill. Secondary buttons use the forest surface and a line border. Disabled buttons lower opacity to (0.4). The entry action, sign-in and Publish use the primary treatment; preview and draft actions use the secondary treatment.

### Search and administrator fields

The public search is an outlined pill with a minimum height of (40px), a search icon, and (12px) input text. Its enclosing field gets the focus outline. Administrator text and select fields use a filled player-forest surface, moss border, modest corners (6px), and (10px 12px) padding at a minimum height of (44px). Labels sit above, with a (7px) gap before the input; supporting field notes use muted (12px) text.

### Header and anchors

The wordmark returns to the Home introduction. Replay and the shared motion toggle sit at the right. There is no Home/Music switch. The keyboard skip link targets the inline player; legacy #music links reach the collection.

### Mood chips

Outlined, rounded filters with a minimum height of (38px), (7px 19px) desktop padding, and (12px) text. Hover adds a darker forest fill. Selection changes to olive fill, dark text and semibold weight. The selected state is also exposed with aria-pressed. At the narrow phone breakpoint, their minimum height is (36px).

### Setup and supporting containers

The administrator setup card uses a slightly lighter forest fill, a moss stroke, medium corners and (25px) padding. It arranges explanation and setup steps in two columns, then stacks on phones. Discord is a flat supporting section under the biography on desktop and after the collection on phones, keeping live identity and status distinct from the main Panda profile. Status text accompanies the presence dot.

### Track rows

A flat, divided list with artwork, serif track name, muted artist/source fallback, favorite and queue actions, and tabular time. Hover changes the row tone and reveals the artwork play overlay; focus on the artwork also reveals it. A current row keeps the overlay visible and uses a darker forest rounded highlight. Track titles underline on hover. Local audio and SoundCloud badges retain their separate source treatments.

### Compact corner player and queue

The single mounted engine drives vinyl artwork, metadata, play/pause, previous/next, shuffle, repeat, seek, volume and favorites. The Library button and Home's Choose a song action open the collection above the player. Queue uses its own bounded panel in the same position. Player feedback remains inside the compact player, with retry and dismiss controls. No separate Music tab or full-width bottom bar is used.

Scoped overrides live in assets/css/home-player.css, loaded after styles.css. Saved glass and motion preferences, the room canvas and Vinyl Portal remain intact.

## Do's and Don'ts

### Do:

- **Do** use the shared forest, ivory and olive tokens for new controls and surfaces.
- **Do** preserve Lora for headings and track titles, and DM Sans for controls and metadata.
- **Do** keep the Panda as the main profile identity and the original photo within Discord.
- **Do** preserve visible olive focus outlines and text labels for icon actions.
- **Do** keep the compact player and its panels within the viewport and leave footer content reachable.
- **Do** preserve the open Home composition and reveal the collection on demand.

### Don't:

- **Don't** replace the established palette or type pairing with a separate visual system.
- **Don't** style the current track as a filled primary action; keep its darker forest highlight.
- **Don't** turn the vertical music library into a horizontal carousel.
- **Don't** hide the meaning of presence or playback state behind color alone.
- **Don't** expand the resting player into a full-width bar or permanent music workspace.

