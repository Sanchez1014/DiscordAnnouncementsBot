import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionFlagsBits
} from "discord.js";
import fetch from "node-fetch";

// ----------------------
// CLIENT
// ----------------------

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

// ----------------------
// UTILS
// ----------------------

function isAdmin(member) {
  return member.permissions.has(PermissionFlagsBits.Administrator);
}

function errorEmbed(text) {
  return new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle("Error")
    .setDescription(text);
}

function successEmbed(title, text) {
  return new EmbedBuilder()
    .setColor(0x00ff88)
    .setTitle(title)
    .setDescription(text);
}

// ----------------------
// READY
// ----------------------

client.once("ready", () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: "HK / Roblox / DJ_SÁNCHEZ" }],
    status: "online"
  });
});

// ----------------------
// COMMAND HANDLER
// ----------------------

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const name = interaction.commandName;

  try {
    // ---------------------- /announce ----------------------
    if (name === "announce") {
      if (!isAdmin(interaction.member))
        return interaction.reply({
          embeds: [errorEmbed("Solo administradores pueden usar este comando.")],
          ephemeral: true
        });

      const channel = interaction.options.getChannel("channel");
      const title = interaction.options.getString("title");
      const message = interaction.options.getString("message");

      const embed = new EmbedBuilder()
        .setColor(0x00aaff)
        .setTitle(title)
        .setDescription(message)
        .setFooter({ text: `Anuncio por ${interaction.user.tag}` })
        .setTimestamp();

      await channel.send({ embeds: [embed] });

      return interaction.reply({
        embeds: [successEmbed("Anuncio enviado", `Publicado en ${channel}.`)],
        ephemeral: true
      });
    }

    // ---------------------- /ban ----------------------
    if (name === "ban") {
      if (!isAdmin(interaction.member))
        return interaction.reply({
          embeds: [errorEmbed("Solo administradores pueden usar este comando.")],
          ephemeral: true
        });

      const user = interaction.options.getUser("user");
      const reason = interaction.options.getString("reason") || "Sin razón.";

      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member)
        return interaction.reply({
          embeds: [errorEmbed("Ese usuario no está en el servidor.")],
          ephemeral: true
        });

      await interaction.deferReply({ ephemeral: true });

      await member.ban({ reason: `Ban por ${interaction.user.tag} | ${reason}` });

      return interaction.editReply({
        embeds: [successEmbed("Usuario baneado", `${user.tag} fue baneado.`)]
      });
    }

    // ---------------------- /activeplayers ----------------------
    if (name === "activeplayers") {
      const placeId = process.env.ROBLOX_PLACE_ID;
      if (!placeId)
        return interaction.reply({
          embeds: [errorEmbed("Falta ROBLOX_PLACE_ID en Railway.")],
          ephemeral: true
        });

      await interaction.deferReply();

      const res = await fetch(
        `https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeId}`
      );
      const data = await res.json();

      if (!data[0])
        return interaction.editReply({
          embeds: [errorEmbed("No encontré ese juego en Roblox.")]
        });

      const info = data[0];

      const embed = new EmbedBuilder()
        .setColor(0x00ffcc)
        .setTitle("Jugadores activos")
        .setDescription(
          `Juego: **${info.name}**\nJugadores: **${info.playing}**\nPlace ID: \`${placeId}\``
        );

      return interaction.editReply({ embeds: [embed] });
    }

    // ---------------------- /coinflip ----------------------
    if (name === "coinflip") {
      const result = Math.random() < 0.5 ? "Cara" : "Cruz";
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xffff00)
            .setTitle("Coinflip")
            .setDescription(`Resultado: **${result}**`)
        ]
      });
    }

    // ---------------------- /rate ----------------------
    if (name === "rate") {
      const thing = interaction.options.getString("thing");
      const score = Math.floor(Math.random() * 100) + 1;

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xff66ff)
            .setTitle("Calificación")
            .setDescription(`Califico **${thing}** con un **${score}/100**.`)
        ]
      });
    }

    // ---------------------- /meme ----------------------
    if (name === "meme") {
      const memes = [
        "https://i.imgflip.com/30b1gx.jpg",
        "https://i.imgflip.com/1bgw.jpg",
        "https://i.imgflip.com/4t0m5.jpg"
      ];
      const url = memes[Math.floor(Math.random() * memes.length)];

      return interaction.reply({
        embeds: [
          new EmbedBuilder().setColor(0x00ffff).setTitle("Meme random").setImage(url)
        ]
      });
    }

    // ---------------------- /robloxuser ----------------------
    if (name === "robloxuser") {
      const username = interaction.options.getString("username");

      await interaction.deferReply();

      const res = await fetch(
        `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(
          username
        )}&limit=1`
      );
      const data = await res.json();

      if (!data.data[0])
        return interaction.editReply({
          embeds: [errorEmbed("No encontré ese usuario.")]
        });

      const user = data.data[0];

      const embed = new EmbedBuilder()
        .setColor(0x00ccff)
        .setTitle(`Usuario: ${user.name}`)
        .setDescription(user.description || "Sin descripción.")
        .addFields(
          { name: "ID", value: `${user.id}`, inline: true },
          { name: "Display Name", value: user.displayName, inline: true }
        )
        .setURL(`https://www.roblox.com/users/${user.id}/profile`);

      return interaction.editReply({ embeds: [embed] });
    }

    // ---------------------- /friends ----------------------
    if (name === "friends") {
      const username = interaction.options.getString("username");

      await interaction.deferReply();

      const search = await fetch(
        `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(
          username
        )}&limit=1`
      );
      const sData = await search.json();

      if (!sData.data[0])
        return interaction.editReply({
          embeds: [errorEmbed("No encontré ese usuario.")]
        });

      const user = sData.data[0];

      const friendsRes = await fetch(
        `https://friends.roblox.com/v1/users/${user.id}/friends/count`
      );
      const fData = await friendsRes.json();

      const embed = new EmbedBuilder()
        .setColor(0x33dd33)
        .setTitle(`Amigos de ${user.name}`)
        .setDescription(`Tiene **${fData.count}** amigos.`)
        .setURL(`https://www.roblox.com/users/${user.id}/profile`);

      return interaction.editReply({ embeds: [embed] });
    }

    // ---------------------- /gameinfo ----------------------
    if (name === "gameinfo") {
      const placeId = interaction.options.getString("placeid");

      await interaction.deferReply();

      const res = await fetch(
        `https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeId}`
      );
      const data = await res.json();

      if (!data[0])
        return interaction.editReply({
          embeds: [errorEmbed("No encontré ese juego.")]
        });

      const info = data[0];

      const embed = new EmbedBuilder()
        .setColor(0x8888ff)
        .setTitle(info.name)
        .setDescription(info.description || "Sin descripción.")
        .addFields(
          { name: "Place ID", value: `${info.placeId}`, inline: true },
          { name: "Jugadores", value: `${info.playing}`, inline: true },
          { name: "Visitas", value: `${info.visits}`, inline: true }
        )
        .setURL(`https://www.roblox.com/games/${info.placeId}`);

      return interaction.editReply({ embeds: [embed] });
    }
  } catch (err) {
    console.error(err);
    return interaction.reply({
      embeds: [errorEmbed("Ocurrió un error inesperado.")],
      ephemeral: true
    });
  }
});

// ----------------------
// LOGIN
// ----------------------

client.login(process.env.DISCORD_TOKEN);