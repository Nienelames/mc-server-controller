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
    const messages = [
      ...Array(Math.ceil(response.length / 2000)).keys(),
    ].flatMap((index) => response.slice(index * 2000, (index + 1) * 2000));
    await interaction.editReply(
      "Command executed successfully :white_check_mark:"
    );
    for (const message of messages) {
      await interaction.followUp(message);
    }
  },
};
