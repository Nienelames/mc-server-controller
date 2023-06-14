const { runCommand, isAliveServer } = require("../serverControls");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("run-command")
    .setDescription("Runs a command via the server console")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The command to run")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!(await isAliveServer())) {
      await interaction.reply("Server not running :x:");

      return;
    }
    await interaction.reply("Running command :hourglass:");
    const command = interaction.options.getString("command");
    const response = await runCommand(command);
    await interaction.editReply(
      `Command executed successfully :white_check_mark:\n${response}`
    );
  },
};
