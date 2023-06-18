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
    await interaction.reply("Executing :hourglass:");

    if (!isAliveHost()) {
      await interaction.editReply("Powering on host :hourglass:");
      await powerOnHost();
      await interaction.editReply("Host powered on :white_check_mark:");

      await interaction.editReply("Starting server :hourglass:");
      await startServer();
      await interaction.editReply("Server running :white_check_mark:");
      interaction.client.user.setActivity("Enigmatica 6");

      return;
    }

    if (!(await isAliveServer())) {
      await interaction.editReply("Starting server :hourglass:");
      await startServer();
      await interaction.editReply("Server running :white_check_mark:");
      interaction.client.user.setActivity("Enigmatica 6");

      return;
    }

    await interaction.reply("Server already running :x:");
  },
};
