require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commands = [

  // /announce
  new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Publica un anuncio con título y mensaje.')
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('Canal donde publicar').setRequired(true))
    .addStringOption(opt =>
      opt.setName('title').setDescription('Título del anuncio').setRequired(true))
    .addStringOption(opt =>
      opt.setName('message').setDescription('Mensaje del anuncio').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  // /activeplayers
  new SlashCommandBuilder()
    .setName('activeplayers')
    .setDescription('Muestra cuántos jugadores están activos en tu juego de Roblox.')
    .setDMPermission(false),

  // /ban
  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banea a un usuario con razón, tiempo y explicación.')
    .addUserOption(opt =>
      opt.setName('user').setDescription('Usuario a banear').setRequired(true))
    .addStringOption(opt =>
      opt.setName('razon').setDescription('Razón del baneo').setRequired(true))
    .addStringOption(opt =>
      opt.setName('tiempo').setDescription('Tiempo del baneo (ej. permanente, 7 días)').setRequired(true))
    .addStringOption(opt =>
      opt.setName('explicacion').setDescription('Explicación detallada del baneo').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)

].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('⏳ Registrando comandos globales...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Comandos globales registrados correctamente.');
    console.log('⏳ Discord puede tardar hasta 1 hora en mostrarlos.');
  } catch (err) {
    console.error('❌ Error registrando comandos:', err);
  }
})();