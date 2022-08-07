module.exports = (vote, message, counts) => {
  const total = Object.values(counts ?? {}).reduce((sum, i) => sum + i);

  message.reply({
    embeds: [
      {
        title: message.embeds[0]?.title,
        fields: vote.choices.map(i => ({
          name: i[0] + ' ' + i[1],
          value: counts[i[0]] + '票 (' + (Math.round(counts[i[0]] / total * 1000) / 10) + '%)',
        })),
      }
    ]
  })
}
