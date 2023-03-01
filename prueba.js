const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES // <= Don't miss this :)
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}`);
})

client.on('messageCreate', async (message) => {
    if (message.content === '!play') {
        if (!message.member.voice?.channel) return message.channel.send('You need to be a voice channel to execute this command')

        const connection = joinVoiceChannel({
            channelId: message.member.voice.channelId,
            guildId: message.guildId,
            adapterCreator: message.guild.voiceAdapterCreator
        })

        const player = createAudioPlayer()
        const resource = createAudioResource('./music/song.mp3')

        connection.subscribe(player)

        player.play(resource)
    }
})

client.login('Token Here')