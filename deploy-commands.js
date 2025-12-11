require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const announce = new SlashCommandBuilder()
  .setName('announce')
  .setDescription('Publica un anuncio plano con título y mensaje.')
  .addChannelOption(opt =>
    opt.setName('channel').setDescription('Canal donde publicar').setRequired(true))
  .addStringOption(opt =>
    opt.setName('title').setDescription('Título del anuncio').setRequired(true))
  .addStringOption(opt =>
    opt.setName('message').setDescription('Texto del anuncio').setRequired(true));

const commands = [announce.toJSON()];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID_1),
      { body: commands }
    );
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID_2),
      { body: commands }
    );
    console.log('✅ Comando /announce registrado en ambos servidores.');
  } catch (err) {
    console.error(err);
  }
})();