const fs = require('fs');

exports.setData = (serverId, path, value) => {
  let fileName = 'data/' + serverId + '.json'
  let data = fs.existsSync(fileName) ? JSON.parse(fs.readFileSync(fileName)) : {}
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

exports.getData = (serverId, path) => {
  let fileName = 'data/' + serverId + '.json'
  let data = fs.existsSync(fileName) ? JSON.parse(fs.readFileSync(fileName)) : {}
  let parent = data;
  let value;
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

exports.deleteData = (serverId, path) => {
  let fileName = 'data/' + serverId + '.json'
  let data = fs.existsSync(fileName) ? JSON.parse(fs.readFileSync(fileName)) : {}
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
