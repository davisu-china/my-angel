# 我的天使 · 私人告白

One cinematic experience for 王梓烨: a photo cover, three private portraits, one full-width meteor Canvas narrative and a short personal note. The mobile-first reading flow replaces the old film tabs and duplicate closing credits. Only 星落倾心 remains, with layered accelerating meteors, water reflections, splash crowns and perspective ripple rings. A branching sakura tree blooms along the shore, sheds petals and reflects on the water, alongside the blue/gold painted sky. The finale now reveals an original illustrated girl with shaded hair, expressive eyes, a pearlescent iridescent dress and dimensional particle highlights. A suited man arrives, lowers onto one knee and offers an opening ring box with a faceted, softly sparkling diamond. The girl reaches toward him beneath a delicate heart constellation. This is stylized Canvas illustration with depth cues, not a photorealistic or WebGL 3D reconstruction. The 40-second narrative stays in one Canvas; the cover has a separate compact particle-name dedication. No new effect panels, question screens or buttons are added. The duration note, pause/replay buttons, chapter tabs and transition link remain removed, as do retired standalone effects, full-screen name scenes and theme selections.

Tree geometry is seeded and generated on resize. Flower/glow sprites, tree growth stages, the shaded girl portrait and the slowly moving painted sky are cached in offscreen canvases, with direct Canvas drawing as a fallback. Girl particles are grouped by color/opacity to reduce draw calls. Phones use fewer meteors, petals and particles, and the couple is centered together to keep the kneeling man inside the frame. The proposal stages are deterministic: girl reveal at 25–29s, man arrival at 27–29.5s, kneeling at 29.5–32.5s, ring offering at 32–34.8s, and the girl's response at 34–36.5s. The final pose holds before a brief character fade at 39–40s. There are no strobe flashes or camera shake; reduced-motion mode immediately shows the completed still proposal, tree and sky.

## Particle Dedication

The cover's “献给 ·” label stays quiet while “王梓烨” assembles from warm-gold particles spiraling upward. The three characters gather with a slight stagger, then hold as a crisp particle name rather than a repeating dissolve. This small dedicated Canvas is independent of the meteor/proposal narrative; no retired theme or full-screen name scene returns. Its 4.8-second entrance runs only when visible and stops scheduling frames after completion. Font readiness and container resize rebuild the glyph mask without restarting progress. Reduced-motion preference immediately shows the finished name. Ordinary Chinese text remains available to screen readers and as the visual fallback when scripting or Canvas sampling is unavailable; there are no external font requests or added controls.

## Layout and Interaction

Desktop uses a split photo cover and staggered three-column photo journal; phones use a portrait cover, single-column staggered photos, edge-to-edge sky and readable letter. Breakpoints at 900, 680 and 360 pixels cover tablet, phone and narrow-phone layouts, with safe-area insets, small-viewport height units and a short landscape variant. Navigation and dialog actions have at least 44-pixel touch targets. No horizontal swipe carousel is needed to read the page.

Photos open in a dialog with previous/next buttons, keyboard arrows and horizontal touch swipes. Opening it locks background scrolling and pauses Canvas rendering; closing it restores focus and rendering. Pinch and vertical scroll gestures do not change photos. The sky animates automatically only while visible. System reduced-motion preference displays the completed proposal as a still scene; keyboard users can focus the sky and press Space to pause/resume or Escape to pause, without restoring the deleted control panel.

See [使用说明.md](./使用说明.md) for opening, customization, interaction behavior and deployment status.

The portable browser experience lives in `experience/`. Run `npm run dev:offline` for a dependency-free preview, or open `experience/index.html`. Run `npm run build:offline` for the self-contained `offline/我的天使_私人告白.html` export and to sync the vinext app's `public/experience/` route. Normal app dev/build/start commands run this sync automatically.

## Soundtrack

Default soundtrack: **Angel — Yoon Mi-rae (尹美莱), Tiger JK (徐正权), and Bizzy**. The user-provided file is included as `experience/assets/bgm.mp3` (about 4:15; the repository's existing 128 kbps version is preserved). There are no music buttons, player controls, soundtrack cards or file pickers. The current audio preloads and attempts muted playback, then unmutes on a normal click, tap, Enter or Space without a prompt. Music loops, pauses when hidden and attempts to resume when the page returns. Autoplay restrictions cannot be bypassed; playback failures stay silent and do not interrupt the experience.

The audio element's `data-src` is set to `assets/bgm.mp3`. The offline build embeds it; the hosted copy uses the file. MP3, M4A, OGG and WAV are supported. Media rights remain with their respective owners; including a user-provided file does not grant redistribution rights.

## Private Media

The optimized cover photo (`ziye-evening.jpg`), three journal photos (`ziye-warm.jpg`, `ziye-daylight.jpg`, and `ziye-cafe.jpg`) and user-supplied `bgm.mp3` are included in Git for this experience. The café photo replaces only the third journal photo, with black borders cropped and no facial edits; the cover stays unchanged. Original photo attachments, additional media, generated `public/experience/`, offline HTML and ZIPs are not included. Missing photos still fall back to a starlight placeholder. See `experience/assets/README.md`. A public repository makes included media downloadable; confirm the relevant sharing permissions before publication. Review actual hosting output, which can contain locally added media even when Git ignores it.

The intended remote is `https://github.com/davisu-china/my-angel`. A local commit or archive is not confirmation that a remote push succeeded. Fetch and inspect the existing remote branch before integrating; do not force-push or overwrite existing history.

The Sites starter structure remains available for a Worker build once dependencies and the hosting connector are available. No database or third-party network services are required for the experience.
