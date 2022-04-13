const { copyFileSync, existsSync } = require('fs')
const { join } = require('path')

const flout = join(__dirname, '..', 'dist')
if (existsSync(flout)) {
  new Array('package.json', 'yarn.lock', 'schema.json', '.npmignore', 'README.md', 'GUIDE.md')
    .forEach(file => {
      const fin = join(__dirname, '..', file)
      if (existsSync(fin)) {
        const fout = join(flout, file)
        copyFileSync(fin, fout)
      }
    })
}