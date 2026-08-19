/* Valida os eventos, metadados e arquivos de imagem do acervo. */
const fs = require("fs");
const vm = require("vm");

function run(file, suffix) {
  const context = {};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(file, "utf8") + suffix, context);
  return context.result;
}

const events = run("events.js", ";globalThis.result=EVENTS");
const errors = [];

events.forEach(function (entry) {
  if (!fs.existsSync(entry.data)) { errors.push(entry.id + ": data.js não encontrado"); return; }
  const data = run(entry.data, ";globalThis.result={event:EVENT,gallery:GALLERY}");
  if (data.event.id !== entry.id) errors.push(entry.id + ": identificador divergente");
  if (data.event.photoCount !== data.gallery.length) errors.push(entry.id + ": contador de fotos divergente");
  if (entry.photoCount !== data.gallery.length) errors.push(entry.id + ": contador do catálogo divergente");
  data.gallery.forEach(function (photo) { if (!fs.existsSync(photo.f)) errors.push(entry.id + ": imagem ausente — " + photo.f); });
});

if (errors.length) {
  console.error("Falha na validação:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log("Validação concluída: " + events.length + " álbuns íntegros.");
