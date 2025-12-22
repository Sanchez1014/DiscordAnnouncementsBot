import "dotenv/config";
import {
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

// ----------------------
// ADMIN
// ----------------------

const announce = new SlashCommandBuilder()
  .setName("announce")
  .setDescription("Publica un anuncio en texto plano.")
  .addChannelOption(opt =>
    opt.setName("channel").setDescription("Canal donde enviar").setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName("title").setDescription("Título del anuncio").setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName("message").setDescription("Mensaje del anuncio").setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

const ban = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("Banea a un usuario del servidor.")
  .addUserOption(opt =>
    opt.setName("user").setDescription("Usuario a banear").setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName("reason").setDescription("Razón del ban").setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

const robloxBanSim = new SlashCommandBuilder()
  .setName("robloxbansim")
  .setDescription("Registra un ban simulado de Roblox.")
  .addStringOption(opt =>
    opt.setName("user").setDescription("Usuario de Roblox").setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName("reason").setDescription("Razón del ban").setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName("time").setDescription("Duración (ej: 1 día, permanente)").setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName("details").setDescription("Detalles adicionales").setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

// ----------------------
// GENERALES
// ----------------------

const ping = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Muestra la latencia del bot.");

const userinfo = new SlashCommandBuilder()
  .setName("userinfo")
  .setDescription("Muestra información de un usuario.")
  .addUserOption(opt =>
    opt.setName("user").setDescription("Usuario (opcional)").setRequired(false)
  );

const serverinfo = new SlashCommandBuilder()
  .setName("serverinfo")
  .setDescription("Muestra información del servidor.");

// ----------------------
// ROBLOX (PLACE ID)
// ----------------------

const activePlayers = new SlashCommandBuilder()
  .setName("activeplayers")
  .setDescription("Muestra jugadores activos del juego configurado.");

const gameinfo = new SlashCommandBuilder()
  .setName("gameinfo")
  .setDescription("Información del juego por Place ID.")
  .addStringOption(opt =>
    opt.setName("placeid").setDescription("Place ID (opcional, usa el configurado si se omite)").setRequired(false)
  );

const robloxUser = new SlashCommandBuilder()
  .setName("robloxuser")
  .setDescription("Busca un usuario de Roblox.")
  .addStringOption(opt =>
    opt.setName("username").setDescription("Nombre de usuario").setRequired(true)
  );

const friends = new SlashCommandBuilder()
  .setName("friends")
  .setDescription("Muestra cuántos amigos tiene un usuario de Roblox.")
  .addStringOption(opt =>
    opt.setName("username").setDescription("Nombre de usuario").setRequired(true)
  );

// ----------------------
// FUN
// ----------------------

const coinflip = new SlashCommandBuilder()
  .setName("coinflip")
  .setDescription("Lanza una moneda.");

const rate = new SlashCommandBuilder()
  .setName("rate")
  .setDescription("Califico algo del 1 al 100.")
  .addStringOption(opt =>
    opt.setName("thing").setDescription("Cosa a calificar").setRequired(true)
  );

const meme = new SlashCommandBuilder()
  .setName("meme")
  .setDescription("Envía un meme aleatorio.");

// ----------------------
// REGISTER
// ----------------------

const commands = [
  announce,
  ban,
  robloxBanSim,
  ping,
  userinfo,
  serverinfo,
  activePlayers,
  gameinfo,
  robloxUser,
  friends,
  coinflip,
  rate,
  meme
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

console.log("Registrando comandos globales...");

await rest.put(
  Routes.applicationCommands(process.env.CLIENT_ID),
  { body: commands }
);

console.log("Comandos registrados correctamente.");