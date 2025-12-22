import "dotenv/config";
import {
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

// ----------------------
// COMANDOS ADMIN
// ----------------------

const announce = new SlashCommandBuilder()
  .setName("announce")
  .setDescription("Publica un anuncio plano con título y mensaje.")
  .addChannelOption(opt =>
    opt.setName("channel").setDescription("Canal donde publicar").setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName("title").setDescription("Título del anuncio").setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName("message").setDescription("Contenido del anuncio").setRequired(true)
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

// ----------------------
// COMANDOS PARA TODOS
// ----------------------

const activePlayers = new SlashCommandBuilder()
  .setName("activeplayers")
  .setDescription("Muestra cuántos jugadores están activos en tu juego de Roblox.");

const coinflip = new SlashCommandBuilder()
  .setName("coinflip")
  .setDescription("Lanza una moneda.");

const rate = new SlashCommandBuilder()
  .setName("rate")
  .setDescription("Califico algo del 1 al 100.")
  .addStringOption(opt =>
    opt.setName("thing").setDescription("¿Qué quieres que califique?").setRequired(true)
  );

const meme = new SlashCommandBuilder()
  .setName("meme")
  .setDescription("Envía un meme aleatorio.");

// ----------------------
// COMANDOS ROBLOX
// ----------------------

const robloxUser = new SlashCommandBuilder()
  .setName("robloxuser")
  .setDescription("Busca un usuario de Roblox por nombre.")
  .addStringOption(opt =>
    opt.setName("username").setDescription("Nombre del usuario").setRequired(true)
  );

const friends = new SlashCommandBuilder()
  .setName("friends")
  .setDescription("Muestra cuántos amigos tiene un usuario de Roblox.")
  .addStringOption(opt =>
    opt.setName("username").setDescription("Nombre del usuario").setRequired(true)
  );

const gameinfo = new SlashCommandBuilder()
  .setName("gameinfo")
  .setDescription("Muestra información de un juego de Roblox por Place ID.")
  .addStringOption(opt =>
    opt.setName("placeid").setDescription("Place ID del juego").setRequired(true)
  );

// ----------------------
// REGISTRO GLOBAL
// ----------------------

const commands = [
  announce,
  ban,
  activePlayers,
  coinflip,
  rate,
  meme,
  robloxUser,
  friends,
  gameinfo
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

console.log("⏳ Registrando comandos globales...");

try {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );
  console.log("✅ Comandos globales registrados correctamente.");
  console.log("⏳ Discord puede tardar hasta 1 hora en mostrarlos.");
} catch (err) {
  console.error("❌ Error registrando comandos:", err);
}