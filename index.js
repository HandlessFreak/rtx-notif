/**
 * Join link
 * https://discord.com/api/oauth2/authorize?client_id=794431055721267212&permissions=84992&scope=bot
 */

const Discord = require('discord.js'),
    axios = require('axios'),
    cheerio = require('cheerio'),
    client = new Discord.Client(),
    fs = require('fs'),
    mongoose = require('mongoose'),
    Website = require('./models/Website'),
    commands = require('./scripts/commands');

const members = [],
    watchlist = [];

/**
 * Send a DM to everyone who wants to be notified of the in-stock product
 * @param {String} webpage - URL of website with product that is in stock
 */
const notify = (webpage) => {
    members.forEach(member => {
        member.send('This card is in stock!\n' + webpage);
    });
}

/**
 * Sleep function to sleep for a specified amount of time.
 * @param {int} milliseconds - How long to sleep for
 * @returns - Promise to sleep for the specified amount of time
 */
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

/**
 * Function to loop and check for a product coming in stock
 * TODO: store a list of added URLs to be watched, but get list of users from DB when needed
 */
const run = async () => {
    let found = false;
    while (true) {
        // for each URL
        await watchlist.forEach(url => {
            // get the HTML
            axios.get(url)
                .then((res) => {
                    // load the HTML into cheerio
                    const $ = cheerio.load(res.data);
                    // if 'Add to Cart' button is available, notify all users
                    if ('Add to Cart' == $('.btn-lg').html()) {
                        notify(url);
                        found = true;
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        });
        // if there has not been a restock, wait 10 seconds before checking again
        if (!found) {
            await sleep(10000);
            // if there has been a restock wait like 6 hours or something idk
        } else {
            found = false;
            await sleep(60000000);
        }
    }
}

async function main(credentials) {
    // initiate connection to the Mongo database
    await connectToDB(credentials.mongoURL);
    // initialize all events to be handled by Discord.JS
    await initDiscordEvents(credentials.token)
    // start checking websites
    run();
}

const connectToDB = async (url) => {
    // connect to db
    console.log('Connecting to db...');
    await mongoose.connect(url, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('Connected to db.');
    });
}

const initDiscordEvents = async (token) => {
    // login to discord
    await client.login(token);

    /**
     * Handles a new message in an included server the bot is already in
     */
    client.on('message', message => {
        // if the message is not a command or is sent by a bot, ignore the message
        if (!message.content.startsWith('!') || message.author.bot) return;
        commands.handleCommand(message);
    });

    client.once('ready', () => {
        console.log('Running...');
    });
}


// get Discord token from credentials.json and store in credentials object
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.error('No credentials found', err);
    main(JSON.parse(content)).catch(e => {
        console.error(e);
        throw e;
    });
});