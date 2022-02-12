const TOKEN = "Your bot token"
const channel = "936621813033746533";
const _channel = "942050124610281543";
const _fst = ["person_1", "person_2"];

// Code - Dont touch if you dont understand
const Discord = require('discord.js');
const Client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_VOICE_STATES"]
});

let missedLast = [];
let _missedLast = [];
let completed = [];
let waitingFor = [];

let l_message = null;
let n = 3;

Client.on('ready', () => {
    checkAFK(Client);
    setInterval(checkAFK, 1800000, Client);
})

Client.on('interactionCreate', (interaction) => {
    console.log(waitingFor);
    if (!interaction.isButton()) return;

    if (!interaction.customId == "ok") return;

    if (!waitingFor.includes(interaction.member.id)) {
        return interaction.reply({ content: 'You dont need to do this, your not in the vc', ephemeral: true });
    }

    if (completed.includes(interaction.member.id)) {
        return interaction.reply({ content: 'You dont need to do this, you have already confirmed', ephemeral: true });
    }

    i = waitingFor.indexOf(interaction.member.id);
    waitingFor.splice(i, 1);

    completed.push(interaction.member.id);

    interaction.reply({ content: `${interaction.member.user.username} has verified they are here` });
})

Client.login(TOKEN);

async function checkAFK(Client) {
    const c = Client.channels.cache.get(channel) || await Client.channels.fetch(channel).catch((e) => { console.log(e) });
    const vc = Client.channels.cache.get(_channel) || await Client.channels.fetch(_channel).catch((e) => { console.log(e) });

    if (!c || !vc) {
        console.log(`WARN - FAILED AUTO AFK CHECK #${n}. PLEASE DO A MANUAL ONE`);
        return;
    }

    const members = vc.members.map(member => member.id);
    const need_checking = [];

    for (var _x = 0; _x < members.length; _x++) {
        const person = members[_x];
        console.log(person)
        if (_fst.includes(person)) need_checking.push(person);
    }

    const Embed = new Discord.MessageEmbed()
        .setTitle(`TRR EVENT - AFK CHECK #${n}`)
        .setDescription('Please press "ok" bellow to be logged as online');
    //

    const Row = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId('ok')
                .setLabel('ok')
                .setStyle('SUCCESS')
        )

    m = await c.send({ content: `<@!${need_checking.join('> <@!')}>`, embeds: [Embed], components: [Row] }).catch((e) => {
        console.log(e);
        console.log(`WARN - FAILED AUTO AFK CHECK #${n}.PLEASE DO A MANUAL ONE`);
    });

    waitingFor = need_checking;

    l_message = m.id;
    n++;

    setTimeout(done, 300000, Client);
}

async function done(Client) {
    const vc = Client.channels.cache.get(_channel);
    const m = await Client.channels.cache.get(channel).messages.fetch(l_message);

    m.edit({
        content: 'Check complete', components: []
    })

    _missedLast = missedLast;
    missedLast = waitingFor;

    for (const user of missedLast) {
        if (_missedLast.includes(user)) {
            const mem = vc.members.get(user);
            if (!mem) return // they left the vc
            mem.voice.disconnect('Has gone afk').catch((e) => { console.log(e) });
        }
    }

    completed = [];
}
