require("dotenv").config();
const { Client, Intents } = require("discord.js");
const express = require('express');
const { connect } = require("puppeteer");
const app = express()
const port = process.env.PORT
const server = app.listen(port)
server.keepAliveTimeout = 60 * 1000;
server.headersTimeout = 61 * 1000;

const { fetchData } = require("./fetcher")

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.MESSAGE_CONTENT
    ]
});


client.once("ready", async () => {
    let cardsToPost = []

    const mainChannel = await client.channels.cache.get("931104242901590047")
    const data  = await fetchData()
    await mainChannel.messages.fetch({ limit: 2 }).then(messages => {
        const lastMessage = messages.last()
        const { content } = lastMessage

        console.log(data[0])

        for (let obj of data) {
            if (content.includes(obj.name)) {
                break;
            }
            cardsToPost = [...cardsToPost, obj]
        }
    })

    console.log(cardsToPost)

    client.channels.cache.forEach(c => {
        if(c.guild.me.permissionsIn(c.id).has('MANAGE_WEBHOOKS') && c.guild.me.permissionsIn(c.id).has('SEND_MESSAGES')) {
            for (let obj of cardsToPost.reverse()) {
                c.send(`
**${obj.name}**
*${obj.type}*

\`\`\`${obj.desc}\`\`\`
                `)
        
                c.send(obj.img)
            }
        }
    })
    
    
})


app.get('/', async (req, res) => {
    res.end('ran')
})

client.login(process.env.TOKEN);