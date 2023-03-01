const { SlashCommandBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  StreamType,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const path = require("path");

const ytdl = require("ytdl-core");
const yts = require("yt-search");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Reproducir musica!")
    .addStringOption(option =>
			option
				.setName('nombre')
				.setDescription('Nombre de la cancion')),
  async execute(interaction, message) {
    const memberVoiceState = interaction.member.voice;
    if (!memberVoiceState || !memberVoiceState.channelId) {
      interaction.reply("Necesitas unirte a un canal de voz primero");
      return;
    }

    // Intenta unirse al canal de voz en el que está el usuario que ejecuta el comando
    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channel.id,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      keepAlive: true,
    });


    // const songName = interaction.options.getString("nombre");

     const songName = interaction.options.getString('nombre')

    const busqueda = await yts.search(songName);

    const stream = ytdl(busqueda.all[0].url, { filter: "audioonly" });

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });
    const player = createAudioPlayer();

    player.play(resource);

    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    player.on(AudioPlayerStatus.Playing, () => {
      console.log("Reproduciendo música...");
    });

    player.on(AudioPlayerStatus.Paused, () => {
      console.log("La música se pausó.");
    });

    player.on(AudioPlayerStatus.AutoPaused, () => {
      console.log(
        "La música se pausó automáticamente debido a que no hay usuarios en el canal de voz."
      );
    });

    player.on(AudioPlayerStatus.Buffering, () => {
      console.log("Cargando el archivo de música...");
    });

    player.on(AudioPlayerStatus.Error, (error) => {
      console.error(
        `Se produjo un error al reproducir la música: ${error.message}`
      );
    });

    interaction.reply("Reproduciendo música!");

    // Imprime la conexión en la consola para verificar si el bot está conectado a un canal de voz
    console.log(`Conectado a ${connection.joinConfig.channelId}`);
  },
};
