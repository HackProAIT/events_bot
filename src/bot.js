const https = require('https')
const { MessageEmbed, Client, Intents } = require('discord.js')

const client = new Client({intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MESSAGES,Intents.FLAGS.GUILD_MESSAGE_TYPING]})

client.login(process.env.DISCORD_BOT_TOKEN)

client.on('ready',async()=>{
    console.log(client.user.tag, " the bot has logged in")
})

const options = {
	hostname: 'ctftime.org',
	path: '/api/v1/events/?limit=10',
}

const deleteMsg = async (messages) => {
	const user = await client.user.fetch('ISDF bot')
	const botMessages = []
	const channel = messages.channel
	const allMessages = await channel.messages.fetch({ limit: 100 })
	allMessages.forEach(message => {
		if(message.author.id === user.id)
			botMessages.push(message)
	})
	await channel.bulkDelete(botMessages)
}

const getEvents = (message) => {
	return new Promise((resolve,reject) => {
		let events = ""
		https.get(options, res => {
			console.log(`statusCode: ${res.statusCode}`)
			
			if(res.statusCode != 200)
				reject('error getting reponse')  
			
				res.on('data', event => {
				events += event
			})
			
			res.on('end',()=>{
				events = JSON.parse(events)
				events.forEach(event => {
					const eventEmbed = new MessageEmbed()
						.setColor('#0099ff')
						.setTitle(event.title)
						.setURL(event.url)
						.setThumbnail(event.logo || 'https://i.imgur.com/6CX58ou.jpg')	
						.addField("format",event.format,true)
						.setTimestamp(event.start)
					eventEmbed.fields.inline = true
					message.channel.send({embeds:[eventEmbed]})					
				})
			})
		}).end()
		console.log("***********************")
		resolve('response received')
	})
}

client.on("messageCreate", (message) => {
	setInterval(async() => {
		deleteMsg(message)
		await getEvents(message)
		console.log('request sent...')
    },30000)
})