const { setData, getData, deleteData } = require('../data');

module.exports = async (client) => {
  for (let guild of client.guilds.cache) {
    let channels = client.channels.cache;
    let votes = getData(guild[1].id, ['votes']);
    for (let id of Object.keys(votes ?? {})) {
      for (let vote of Object.keys(votes[id])) {
        channels.get(id).messages.fetch(vote);
      }
    }
  }
}
