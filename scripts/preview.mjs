import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(fileURLToPath(new URL("../experience/", import.meta.url)));
const mimeTypes = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".ogg": "audio/ogg", ".wav": "audio/wav" };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const relative = pathname === "/" ? "index.html" : pathname.slice(1);
    const filename = path.resolve(root, relative);
    if (!filename.startsWith(`${root}${path.sep}`) && filename !== path.join(root, "index.html")) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    const data = await readFile(filename);
    response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filename)] || "application/octet-stream", "Cache-Control": "no-store" });
    response.end(data);
  } catch {
    response.writeHead(404).end("Not found");
  }
});
server.listen(Number(process.env.PREVIEW_PORT || 4173), "127.0.0.1", () => console.log("Preview: http://127.0.0.1:4173"));
