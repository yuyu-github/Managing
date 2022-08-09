import * as fs from 'fs';

export function setData(guildId: string | null, path: string[], value: Object): void {
  if (guildId == null) return;

  let fileName = './data/' + guildId + '.json'
  let data: object = fs.existsSync(fileName) ? JSON.parse(fs.readFileSync(fileName).toString()) : {}
  let parent = data;
  path.forEach((key, i) => {
    if (i == path.length - 1) parent[key] = value;
    else {
      if (parent[key] == null) parent[key] = {};
      parent = parent[key];
    }
  });
  fs.writeFileSync(fileName, JSON.stringify(data));
}

export function getData(guildId: string | null, path: string[]): Object | null {
  if (guildId == null) return null;

  let fileName = './data/' + guildId + '.json'
  let data: object = fs.existsSync(fileName) ? JSON.parse(fs.readFileSync(fileName).toString()) : {}
  let parent = data;
  let value: Object | null = null;
  path.forEach((key, i) => {
    if (i == path.length - 1) {
      value = parent[key];
      return;
    }
    else {
      if (parent[key] == null) {
        value = null;
        return;
      }
      parent = parent[key];
    }
  });
  return value;
}

export function deleteData(guildId: string | null, path: string[]): void {
  if (guildId == null) return;

  let fileName = './data/' + guildId + '.json'
  let data: object = fs.existsSync(fileName) ? JSON.parse(fs.readFileSync(fileName).toString()) : {}
  let parent = data;
  path.forEach((key, i) => {
    if (i == path.length - 1) delete parent[key];
    else {
      if (parent[key] == null) return;
      parent = parent[key];
    }
  });
  fs.writeFileSync(fileName, JSON.stringify(data));
}
