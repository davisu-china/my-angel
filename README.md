# For You — A Private Screening

One cinematic experience for 王梓烨: a photo cover, three private portraits, one full-width meteor Canvas narrative and a short personal note. The mobile-first reading flow replaces the old film tabs and duplicate closing credits. Only 星落倾心 remains: meteor impacts and ripples → animated blue/gold painted sky → a rainbow girl silhouette, looping every 40 seconds. The screenshot's duration note, pause/replay buttons, chapter tabs and transition link are removed, not hidden. There are no retired effects, particle names, theme selections or response sections.

## Layout and Interaction

Desktop uses a split photo cover and staggered three-column photo journal; phones use a portrait cover, single-column staggered photos, edge-to-edge sky and readable letter. Breakpoints at 900, 680 and 360 pixels cover tablet, phone and narrow-phone layouts, with safe-area insets, small-viewport height units and a short landscape variant. Navigation and dialog actions have at least 44-pixel touch targets. No horizontal swipe carousel is needed to read the page.

Photos open in a dialog with previous/next buttons, keyboard arrows and horizontal touch swipes. Opening it locks background scrolling and pauses Canvas rendering; closing it restores focus and rendering. Pinch and vertical scroll gestures do not change photos. The sky animates automatically only while visible. System reduced-motion preference displays a still girl silhouette; keyboard users can focus the sky and press Space to pause/resume or Escape to pause, without restoring the deleted control panel.

See [使用说明.md](./使用说明.md) for opening, customization, interaction behavior and deployment status.

The portable browser experience lives in `experience/`. Run `npm run dev:offline` for a dependency-free preview, or open `experience/index.html`. Run `npm run build:offline` for a self-contained HTML export and to sync the vinext app's `public/experience/` route. Normal app dev/build/start commands run this sync automatically.

## Soundtrack

Default soundtrack: **Angel — Yoon Mi-rae (尹美莱), Tiger JK (徐正权), and Bizzy**. The user-provided file is included as `experience/assets/bgm.mp3` (about 4:15; the repository's existing 128 kbps version is preserved). There are no music buttons, player controls, soundtrack cards or file pickers. The current audio preloads and attempts muted playback, then unmutes on a normal click, tap, Enter or Space without a prompt. Music loops, pauses when hidden and attempts to resume when the page returns. Autoplay restrictions cannot be bypassed; playback failures stay silent and do not interrupt the experience.

The audio element's `data-src` is set to `assets/bgm.mp3`. The offline build embeds it; the hosted copy uses the file. MP3, M4A, OGG and WAV are supported. Media rights remain with their respective owners; including a user-provided file does not grant redistribution rights.

## Private Media

The three optimized photos (`ziye-warm.jpg`, `ziye-daylight.jpg`, and `ziye-evening.jpg`) and user-supplied `bgm.mp3` are included in Git for this experience. Original photo attachments, additional media, generated `public/experience/`, offline HTML and ZIPs are not included. Missing photos still fall back to a starlight placeholder. See `experience/assets/README.md`. A public repository makes included media downloadable; confirm the relevant sharing permissions before publication. Review actual hosting output, which can contain locally added media even when Git ignores it.

The intended remote is `https://github.com/davisu-china/my-angel`. A local commit or archive is not confirmation that a remote push succeeded. Fetch and inspect the existing remote branch before integrating; do not force-push or overwrite existing history.

The Sites starter structure remains available for a Worker build once dependencies and the hosting connector are available. No database or third-party network services are required for the experience.
