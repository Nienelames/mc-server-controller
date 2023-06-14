const { SlashCommandBuilder } = require("discord.js");
const {
  isAliveHost,
  isAliveServer,
  powerOnHost,
  startServer,
} = require("../serverControls");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("start-server")
    .setDescription("Starts the Enigmatica 6 server"),
  async execute(interaction) {
    if (await isAliveServer()) {
      interaction.reply("Server is already running :x:");

      return;
    }

    if (isAliveHost()) {
      await interaction.reply("Starting server :hourglass:");
      await startServer();
      await interaction.editReply("Server running :white_check_mark:");
      interaction.client.user.setActivity("Enigmatica 6");

      return;
    }

    await interaction.reply("Powering on host :hourglass:");
    await powerOnHost();
    await interaction.editReply("Host powered on :white_check_mark:");

    await interaction.editReply("Starting server :hourglass:");
    await startServer();
    await interaction.editReply("Server running :white_check_mark:");
    interaction.client.user.setActivity("Enigmatica 6");
  },
};
