const { isAliveServer, stopServer } = require("../serverControls");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop-server")
    .setDescription("Stops the Enigmatica 6 server"),
  async execute(interaction) {
    if (!(await isAliveServer())) {
      interaction.reply("Server not running :x:");

      return;
    }

    await interaction.reply("Stopping server :hourglass:");
    await stopServer();
    await interaction.editReply("Server stopped :white_check_mark:");
  },
};
