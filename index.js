require('dotenv').config();
const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
const noblox = require('noblox.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {

    // /announce
    if (interaction.commandName === 'announce') {
      const channel = interaction.options.getChannel('channel');
      const title = interaction.options.getString('title');
      const message = interaction.options.getString('message');

      await channel.send(`📢 **${title}**\n${message}`);
      await interaction.reply({ content: '✅ Anuncio enviado.', ephemeral: true });
    }

    // /activeplayers
    if (interaction.commandName === 'activeplayers') {
      const placeId = process.env.ROBLOX_PLACE_ID;

      if (!placeId) {
        return interaction.reply({ content: '⚠️ Falta ROBLOX_PLACE_ID en Railway.', ephemeral: true });
      }

      const info = await noblox.getPlaceInfo(Number(placeId));

      await interaction.reply(
        `🎮 Jugadores activos en **${info.name}**: **${info.playing}**`
      );
    }

    // /ban
    if (interaction.commandName === 'ban') {
      const targetUser = interaction.options.getUser('user');
      const razon = interaction.options.getString('razon');
      const tiempo = interaction.options.getString('tiempo');
      const explicacion = interaction.options.getString('explicacion') || 'No se proporcionó explicación detallada.';

      const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

      if (!member) {
        return interaction.reply({ content: '❌ No encontré a ese usuario en el servidor.', ephemeral: true });
      }

      if (!interaction.memberPermissions.has('BanMembers')) {
        return interaction.reply({ content: '❌ No tienes permisos para banear.', ephemeral: true });
      }

      if (!interaction.guild.members.me.permissions.has('BanMembers')) {
        return interaction.reply({ content: '❌ No tengo permisos para banear en este servidor.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('🚫 Usuario baneado')
        .setColor(0xff0000)
        .addFields(
          { name: '👤 Usuario', value: `${targetUser.tag} (${targetUser.id})` },
          { name: '🧑‍⚖️ Admin', value: `${interaction.user.tag}` },
          { name: '📌 Razón', value: razon },
          { name: '⏱ Tiempo', value: tiempo },
          { name: '📝 Explicación', value: explicacion }
        )
        .setTimestamp();

      await member.ban({
        reason: `${razon} | Tiempo: ${tiempo} | Admin: ${interaction.user.tag}`
      });

      await interaction.reply({ embeds: [embed] });
    }

  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      interaction.reply({ content: '❌ Ocurrió un error ejecutando el comando.', ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);