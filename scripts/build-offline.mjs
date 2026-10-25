import { readFile, writeFile, mkdir, copyFile, cp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = path.join(root, "experience");
const output = path.join(root, "offline");
const hosted = path.join(root, "public", "experience");
const [html, css, effects, app] = await Promise.all([
  readFile(path.join(source, "index.html"), "utf8"),
  readFile(path.join(source, "style.css"), "utf8"),
  readFile(path.join(source, "effects.js"), "utf8"),
  readFile(path.join(source, "app.js"), "utf8"),
]);
const placeholder = `data:image/svg+xml;base64,${(await readFile(path.join(source, "assets", "starlight-placeholder.svg"))).toString("base64")}`;
const javascript = `${effects}\n${app.replaceAll("assets/starlight-placeholder.svg", placeholder)}`;

if (/<\/script/i.test(javascript)) throw new Error("Inline script contains an unsafe closing delimiter.");
if (/<\/style/i.test(css)) throw new Error("Inline style contains an unsafe closing delimiter.");
if (html.match(/<script\s+src=/g)?.length !== 2) throw new Error("Expected two local scripts.");

await mkdir(output, { recursive: true });
await rm(hosted, { recursive: true, force: true });
await mkdir(hosted, { recursive: true });

let document = html
  .replace('<link rel="stylesheet" href="style.css">', `<style>\n${css}\n</style>`)
  .replace('  <script src="effects.js"></script>\n', "")
  .replace('<script src="app.js"></script>', `<script>\n${javascript}\n</script>`);

for (const filename of ["ziye-warm.jpg", "ziye-daylight.jpg", "ziye-evening.jpg"]) {
  let imageSource = placeholder;
  try {
    const bytes = await readFile(path.join(source, "assets", filename));
    imageSource = `data:image/jpeg;base64,${bytes.toString("base64")}`;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    console.log(`Private photo omitted: ${filename}; using starlight placeholder.`);
  }
  document = document.replaceAll(`src="assets/${filename}"`, `src="${imageSource}"`);
}

const audioSource = html.match(/<audio\b[^>]*\bdata-src="([^"]*)"/)?.[1];
if (audioSource) {
  const audioPath = path.resolve(source, audioSource);
  const assetsRoot = path.join(source, "assets") + path.sep;
  const audioTypes = { ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".ogg": "audio/ogg", ".wav": "audio/wav" };
  const contentType = audioTypes[path.extname(audioPath).toLowerCase()];
  if (!audioSource.startsWith("assets/") || !audioPath.startsWith(assetsRoot) || !contentType) {
    throw new Error("Music data-src must reference an MP3, M4A, OGG or WAV inside experience/assets/.");
  }
  const bytes = await readFile(audioPath);
  const embeddedAudio = `data:${contentType};base64,${bytes.toString("base64")}`;
  document = document.replace(`data-src="${audioSource}"`, () => `data-src="${embeddedAudio}"`);
  if (bytes.length > 15 * 1024 * 1024) console.warn("Embedded audio exceeds 15 MB; the offline HTML may be slow to open on mobile.");
}

for (const filename of [
  "打开这里_三种浪漫.html",
  "01_写给梓烨的宇宙来信.html",
  "02_把温柔都留给你.html",
  "03_偏偏是你.html",
  "偏偏是你_王梓烨_电影珍藏版.html",
  "偏偏是你_星落成你升级版.html",
]) {
  await rm(path.join(output, filename), { force: true });
}
await writeFile(path.join(output, "偏偏是你_纯享版.html"), document);
for (const filename of ["index.html", "style.css", "effects.js", "app.js"]) {
  await copyFile(path.join(source, filename), path.join(hosted, filename));
}
await cp(path.join(source, "assets"), path.join(hosted, "assets"), { recursive: true });
await copyFile(path.join(root, "使用说明.md"), path.join(output, "使用说明.md"));
console.log(`Offline build complete: cinema-only HTML, private photos or placeholders, ${audioSource ? "embedded music" : "local song picker"}; hosted assets synced. Generated files are private and Git-ignored.`);
