require('dotenv').config();
const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Bot iniciado correctamente como ${client.user.tag}`);

  // Presencia personalizada: Watching Hong Kong Tijuana
  client.user.setPresence({
    activities: [
      { name: 'Hong Kong Tijuana', type: 3 } // type: 3 = Watching
    ],
    status: 'online'
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'announce') return;

  const isOwner = interaction.guild.ownerId === interaction.user.id;
  const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

  if (!isOwner && !isAdmin) {
    return interaction.reply({ 
      content: 'Solo los owners y administradores pueden usar este comando.', 
      ephemeral: true 
    });
  }

  const channel = interaction.options.getChannel('channel');
  const title = interaction.options.getString('title');
  const message = interaction.options.getString('message');

  if (!channel || !title || !message) {
    return interaction.reply({ 
      content: 'Debes especificar el canal, el título y el mensaje.', 
      ephemeral: true 
    });
  }

  const canSend = channel.permissionsFor(interaction.guild.members.me)?.has(PermissionFlagsBits.SendMessages);
  if (!canSend) {
    return interaction.reply({ 
      content: `No tengo permiso para enviar mensajes en ${channel}.`, 
      ephemeral: true 
    });
  }

  await interaction.deferReply({ ephemeral: true });

  // Mensaje plano, profesional, sin emojis ni líneas
  const formatted = `@everyone @here\n\n**${title}**\n\n${message}`;

  await channel.send(formatted);

  await interaction.editReply('Anuncio publicado correctamente.');
});

client.login(process.env.DISCORD_TOKEN);