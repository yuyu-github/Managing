import * as fs from 'fs';
import * as crypto from 'crypto'

export function createTempFile(extension: string, data: string | NodeJS.ArrayBufferView) {
  let filename = '';
  do {
    filename = crypto.createHash('md4').update(new Date().getTime().toString()).digest('base64').replace(/[\\/:*?"<>|]/g, '_');
  } while (fs.existsSync(`temp/${filename}.${extension}`))
  fs.writeFileSync(`temp/${filename}.${extension}`, data);

  return `temp/${filename}.${extension}`
}
