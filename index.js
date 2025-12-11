require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');
const noblox = require('noblox.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // /announce — admins
  if (interaction.commandName === 'announce') {
    const channel = interaction.options.getChannel('channel');
    const title = interaction.options.getString('title');
    const message = interaction.options.getString('message');

    try {
      await channel.send(`📢 **${title}**\n${message}`);
      await interaction.reply({ content: '✅ Anuncio publicado.', ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ No pude publicar el anuncio.', ephemeral: true });
    }
  }

  // /activeplayers — todos
  if (interaction.commandName === 'activeplayers') {
    try {
      const placeId = process.env.ROBLOX_PLACE_ID;
      if (!placeId) {
        return interaction.reply({ content: '⚠️ Falta ROBLOX_PLACE_ID en variables.', ephemeral: true });
      }
      const gameInfo = await noblox.getPlaceInfo(Number(placeId));
      await interaction.reply(`🎮 Actualmente hay **${gameInfo.playing}** jugadores activos en **${gameInfo.name}**.`);
    } catch (err) {
      console.error(err);
      await interaction.reply('❌ No pude obtener la información del juego.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);