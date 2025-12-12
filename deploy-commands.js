require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// /announce — solo admins
const announce = new SlashCommandBuilder()
  .setName('announce')
  .setDescription('Publica un anuncio plano con título y mensaje.')
  .addChannelOption(opt =>
    opt.setName('channel').setDescription('Canal donde publicar').setRequired(true))
  .addStringOption(opt =>
    opt.setName('title').setDescription('Título del anuncio').setRequired(true))
  .addStringOption(opt =>
    opt.setName('message').setDescription('Texto del anuncio').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false);

// /activeplayers — todos
const activePlayers = new SlashCommandBuilder()
  .setName('activeplayers')
  .setDescription('Muestra cuántos jugadores están activos en tu juego de Roblox.')
  .setDMPermission(false);

const commands = [announce.toJSON(), activePlayers.toJSON()];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID), // 🔥 Global registration
      { body: commands }
    );
    console.log('✅ Comandos registrados globalmente: /announce (admins) y /activeplayers (todos)');
    console.log('⏳ Nota: los comandos globales pueden tardar hasta 1 hora en propagarse.');
  } catch (err) {
    console.error('❌ Error registrando comandos:', err);
  }
})();