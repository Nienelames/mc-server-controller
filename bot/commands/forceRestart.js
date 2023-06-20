const { forceRestart } = require("../serverControls");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("force-restart")
    .setDescription("Forcefully restarts the Enigmatica 6 server"),
  async execute(interaction) {
    await interaction.reply("Attempting reset :hourglass:");
    await forceRestart();
    await interaction.editReply("Server reset and running :white_check_mark:");
  },
};
