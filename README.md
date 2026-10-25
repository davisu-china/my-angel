# For You — A Private Screening

One cinematic experience for 王梓烨: three private portraits, the starlight particle name, six Canvas particle scenes and three film chapters. Theme selection, alternative themes and the closing response section are removed.

See [使用说明.md](./使用说明.md) for opening, customization, interaction behavior and deployment status.

The portable browser experience lives in `experience/`. Run `npm run dev:offline` for a dependency-free preview, or open `experience/index.html`. Run `npm run build:offline` for a self-contained HTML export and to sync the vinext app's `public/experience/` route. Normal app dev/build/start commands run this sync automatically.

## Soundtrack

Proposed track: EXO — **Angel (너의 세상으로), Korean version**, pending artist/version confirmation. No commercial recording is bundled and the previous synthesized melody is removed. The page accepts an authorized local audio file without uploading it, and only plays after an explicit click. It pauses when hidden and does not automatically resume.

For a preconfigured soundtrack, place an authorized audio file at `experience/assets/angel.mp3` and set the audio element's `data-src` to `assets/angel.mp3`. The offline build embeds it; the hosted copy uses the file. MP3, M4A, OGG and WAV are supported. Downloading a song for listening does not itself grant redistribution rights.

## Private Media

Original photos, audio, generated `public/experience/`, offline HTML and ZIPs are Git-ignored. A fresh checkout uses a starlight placeholder instead of publishing personal photos. Add the three named photos locally only with consent; see `experience/assets/README.md`. Builds can contain private media even though those files are ignored by Git. Review actual hosting output before publication.

The intended remote is `https://github.com/davisu-china/my-angel`. A local commit or archive is not confirmation that a remote push succeeded. Fetch and inspect the existing remote branch before integrating; do not force-push or overwrite existing history.

The Sites starter structure remains available for a Worker build once dependencies and the hosting connector are available. No database or third-party network services are required for the experience.
