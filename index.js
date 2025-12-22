import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits
} from "discord.js";
import fetch from "node-fetch";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// --------- HELPERS ---------

function isAdmin(member) {
  return member.permissions.has(PermissionFlagsBits.Administrator);
}

function formatDate(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return String(date);
  return d.toLocaleString();
}

async function getGameInfoFromPlaceId(placeId) {
  // 1) Obtener detalles del place (incluye universeId)
  const placeRes = await fetch(
    `https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeId}`
  );
  if (!placeRes.ok) {
    throw new Error("Error al obtener detalles del place.");
  }
  const placeData = await placeRes.json();
  if (!placeData[0]) {
    throw new Error("No se encontró el place para ese Place ID.");
  }

  const place = placeData[0];
  const universeId = place.universeId;

  // 2) Obtener info del juego por universeId
  const gameRes = await fetch(
    `https://games.roblox.com/v1/games?universeIds=${universeId}`
  );
  if (!gameRes.ok) {
    throw new Error("Error al obtener info del juego por Universe ID.");
  }
  const gameData = await gameRes.json();
  if (!gameData.data || !gameData.data[0]) {
    throw new Error("No se encontró juego para ese Universe ID.");
  }

  const game = gameData.data[0];

  return { place, game };
}

// --------- READY ---------

client.once("ready", () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

// --------- COMMANDS ---------

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const name = interaction.commandName;

  try {
    // ---------- /announce ----------
    if (name === "announce") {
      if (!isAdmin(interaction.member)) {
        return interaction.reply({
          content: "Solo administradores pueden usar este comando.",
          ephemeral: true
        });
      }

      const channel = interaction.options.getChannel("channel");
      const title = interaction.options.getString("title");
      const message = interaction.options.getString("message");

      await channel.send(
        `ANUNCIO\nTítulo: ${title}\nMensaje: ${message}`
      );

      return interaction.reply({
        content: "Anuncio enviado correctamente.",
        ephemeral: true
      });
    }

    // ---------- /ban ----------
    if (name === "ban") {
      if (!isAdmin(interaction.member)) {
        return interaction.reply({
          content: "Solo administradores pueden usar este comando.",
          ephemeral: true
        });
      }

      const user = interaction.options.getUser("user");
      const reason = interaction.options.getString("reason") || "Sin razón especificada.";

      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) {
        return interaction.reply({
          content: "Ese usuario no está en el servidor.",
          ephemeral: true
        });
      }

      await member.ban({ reason });
      return interaction.reply(
        `Usuario baneado: ${user.tag}\nRazón: ${reason}`
      );
    }

    // ---------- /robloxbansim ----------
    if (name === "robloxbansim") {
      if (!isAdmin(interaction.member)) {
        return interaction.reply({
          content: "Solo administradores pueden usar este comando.",
          ephemeral: true
        });
      }

      const user = interaction.options.getString("user");
      const reason = interaction.options.getString("reason");
      const time = interaction.options.getString("time");
      const details = interaction.options.getString("details") || "Sin detalles adicionales.";

      const logMessage =
        `ROBLOX BAN SIMULADO\n` +
        `Usuario de Roblox: ${user}\n` +
        `Duración: ${time}\n` +
        `Razón: ${reason}\n` +
        `Detalles: ${details}\n` +
        `Moderador: ${interaction.user.tag}`;

      return interaction.reply(logMessage);
    }

    // ---------- /ping ----------
    if (name === "ping") {
      const wsPing = client.ws.ping;
      return interaction.reply(`Ping del bot: ${wsPing}ms`);
    }

    // ---------- /userinfo ----------
    if (name === "userinfo") {
      const target = interaction.options.getUser("user") || interaction.user;
      const member = await interaction.guild.members.fetch(target.id).catch(() => null);

      const lines = [];
      lines.push(`Usuario: ${target.tag}`);
      lines.push(`ID: ${target.id}`);
      if (member) {
        lines.push(`Se unió al servidor: ${formatDate(member.joinedAt)}`);
      }
      lines.push(`Cuenta creada: ${formatDate(target.createdAt)}`);

      return interaction.reply(lines.join("\n"));
    }

    // ---------- /serverinfo ----------
    if (name === "serverinfo") {
      const g = interaction.guild;

      const lines = [];
      lines.push(`Servidor: ${g.name}`);
      lines.push(`ID: ${g.id}`);
      lines.push(`Miembros: ${g.memberCount}`);
      if (g.ownerId) lines.push(`Dueño: <@${g.ownerId}>`);
      if (g.preferredLocale) lines.push(`Región/Idioma: ${g.preferredLocale}`);

      return interaction.reply(lines.join("\n"));
    }

    // ---------- /activeplayers ----------
    if (name === "activeplayers") {
      const placeId = process.env.ROBLOX_PLACE_ID;
      if (!placeId) {
        return interaction.reply("Falta configurar ROBLOX_PLACE_ID en las variables.");
      }

      try {
        const { place, game } = await getGameInfoFromPlaceId(placeId);

        return interaction.reply(
          `Juego: ${game.name}\n` +
          `Jugadores activos: ${game.playing}\n` +
          `Visitas: ${game.visits}\n` +
          `Favoritos: ${game.favoritedCount}\n` +
          `Place ID: ${place.placeId}\n` +
          `Universe ID: ${place.universeId}`
        );
      } catch (err) {
        console.error(err);
        return interaction.reply("No pude obtener la información del juego para ese Place ID.");
      }
    }

    // ---------- /gameinfo ----------
    if (name === "gameinfo") {
      const placeIdOption = interaction.options.getString("placeid");
      const placeId = placeIdOption || process.env.ROBLOX_PLACE_ID;

      if (!placeId) {
        return interaction.reply("Falta Place ID. Configura ROBLOX_PLACE_ID o pásalo en el comando.");
      }

      try {
        const { place, game } = await getGameInfoFromPlaceId(placeId);

        const lines = [];
        lines.push(`Nombre: ${game.name}`);
        if (game.description) lines.push(`Descripción: ${game.description}`);
        lines.push(`Jugadores activos: ${game.playing}`);
        lines.push(`Visitas: ${game.visits}`);
        lines.push(`Favoritos: ${game.favoritedCount}`);
        lines.push(`Place ID: ${place.placeId}`);
        lines.push(`Universe ID: ${place.universeId}`);

        return interaction.reply(lines.join("\n"));
      } catch (err) {
        console.error(err);
        return interaction.reply("No pude obtener la información del juego para ese Place ID.");
      }
    }

    // ---------- /robloxuser ----------
    if (name === "robloxuser") {
      const username = interaction.options.getString("username");

      const res = await fetch(
        `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=1`
      );
      if (!res.ok) {
        return interaction.reply("No pude buscar ese usuario en Roblox.");
      }
      const data = await res.json();

      if (!data.data || !data.data[0]) {
        return interaction.reply("No encontré ningún usuario con ese nombre.");
      }

      const user = data.data[0];

      return interaction.reply(
        `Usuario: ${user.name}\n` +
        `ID: ${user.id}\n` +
        `Perfil: https://www.roblox.com/users/${user.id}/profile`
      );
    }

    // ---------- /friends ----------
    if (name === "friends") {
      const username = interaction.options.getString("username");

      const search = await fetch(
        `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=1`
      );
      if (!search.ok) {
        return interaction.reply("No pude buscar ese usuario en Roblox.");
      }
      const sData = await search.json();

      if (!sData.data || !sData.data[0]) {
        return interaction.reply("No encontré ningún usuario con ese nombre.");
      }

      const user = sData.data[0];

      const friendsRes = await fetch(
        `https://friends.roblox.com/v1/users/${user.id}/friends/count`
      );
      if (!friendsRes.ok) {
        return interaction.reply("No pude obtener los amigos de ese usuario.");
      }
      const fData = await friendsRes.json();

      return interaction.reply(
        `Usuario: ${user.name}\nAmigos: ${fData.count}`
      );
    }

    // ---------- /coinflip ----------
    if (name === "coinflip") {
      const result = Math.random() < 0.5 ? "Cara" : "Cruz";
      return interaction.reply(`Resultado: ${result}`);
    }

    // ---------- /rate ----------
    if (name === "rate") {
      const thing = interaction.options.getString("thing");
      const score = Math.floor(Math.random() * 100) + 1;
      return interaction.reply(`Califico ${thing} con un ${score}/100.`);
    }

    // ---------- /meme ----------
    if (name === "meme") {
      const memes = [
        "https://i.imgflip.com/30b1gx.jpg",
        "https://i.imgflip.com/1bgw.jpg",
        "https://i.imgflip.com/4t0m5.jpg"
      ];
      const url = memes[Math.floor(Math.random() * memes.length)];
      return interaction.reply(url);
    }
  } catch (err) {
    console.error(err);
    return interaction.reply({
      content: "Ocurrió un error inesperado al ejecutar el comando.",
      ephemeral: true
    });
  }
});

// --------- LOGIN ---------

client.login(process.env.DISCORD_TOKEN);