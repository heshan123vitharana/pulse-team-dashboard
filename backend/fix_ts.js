const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/routes/**/*.ts');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/parseInt\(req\.params\.([a-zA-Z0-9_]+)\)/g, "parseInt(req.params.$1 as string)");
  fs.writeFileSync(file, content);
}
console.log('Fixed req.params');
