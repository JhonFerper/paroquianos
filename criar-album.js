/* Gera data.js e registra um novo álbum simples no acervo. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const child = require("child_process");

const args = process.argv.slice(2);
const folder = args[0];
const title = args[1];
const year = args[2];
if (!folder || !title || !/^\d{4}$/.test(year || "")) {
  console.error("Uso: node criar-album.js \"Pasta do Evento\" \"Nome do Evento\" 2024");
  process.exit(1);
}
if (!fs.existsSync(folder)) { console.error("Pasta não encontrada: " + folder); process.exit(1); }
const id = (title + "-" + year).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const files = fs.readdirSync(folder).filter(function (file) { return /\.(jpe?g|png)$/i.test(file); });
if (!files.length) { console.error("Nenhuma imagem encontrada."); process.exit(1); }
const gallery = files.map(function (file) {
  const image = path.join(folder, file);
  const original = child.execFileSync("exiftool", ["-s3", "-DateTimeOriginal", image], { encoding: "utf8" }).trim();
  const size = child.execFileSync("identify", ["-format", "%w %h", image], { encoding: "utf8" }).trim().split(/\s+/).map(Number);
  return { f: image, w: size[0], h: size[1], iso: original ? original.slice(0, 10) : "", t: original ? original.slice(11) : "" };
}).sort(function (a,b) { return (a.iso || "9999").localeCompare(b.iso || "9999") || a.f.localeCompare(b.f); });
const event = { id: id, folder: folder, title: title + " " + year, titlePrimary: title, titleAccent: year, kicker: "Paróquia São Francisco de Assis · " + year, summary: "Registros fotográficos da comunidade paroquial.", photoCount: gallery.length, titleArt: null, hasVideo: false, simpleGallery: true, features: [], days: [] };
fs.writeFileSync(path.join(folder, "data.js"), "const EVENT = " + JSON.stringify(event, null, 2) + ";\n\nconst GALLERY = " + JSON.stringify(gallery, null, 2) + ";\n");
const context = {}; vm.createContext(context); vm.runInContext(fs.readFileSync("events.js", "utf8") + ";globalThis.result=EVENTS", context);
const events = context.result.filter(function (item) { return item.id !== id; });
events.push({ id: id, title: title, year: Number(year), photoCount: gallery.length, data: path.join(folder, "data.js") });
events.sort(function (a,b) { return Number(b.year) - Number(a.year); });
fs.writeFileSync("events.js", "const EVENTS = " + JSON.stringify(events, null, 2) + ";\n");
console.log("Álbum registrado: " + event.title + " (" + gallery.length + " fotos).");
