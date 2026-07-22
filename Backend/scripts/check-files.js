const fs = require('fs');
const path = require('path');
const folders = ['config', 'controllers', 'middleware', 'models', 'routes', 'sockets', 'utils'];
let count = 0;
for (const folder of folders) {
  const dir = path.resolve(__dirname, '..', folder);
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith('.js'))) {
    require(path.join(dir, file));
    count += 1;
  }
}
console.log(`Verificación completada: ${count} módulos cargados.`);
