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
 * @param webpage - URL of website with product that is in stock
 */
const notify = (page) => {
    page.users.forEach(async uid => {
        const user = await client.users.fetch(uid);
        user.send('Your item is in stock!\n\n' + page.url);
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
 */
const run = async () => {
    const timers = [];
    let error = false;
    while (true) {
        // get a list of all the websites in the db
        await Website.find({}, async (err, pages) => {
            if (err) {
                error = true;
                return console.error("Error retrieving entries from the database. Trying again in 10 minutes.", err);
            }
            // iterate through each db entry and get the page HTML
            await pages.forEach(page => {
                axios.get(page.url)
                    .then((res) => {
                        // load the webpage into cheerio and check if the item is in stock
                        const $ = cheerio.load(res.data);
                        if ('Add to Cart' === $('.btn-lg').text() || 'Add to Cart' === $('.btn-lg').html()) {
                            // if the item is in and users have not already been notified
                            if (!timers.some(entry => entry.url === page.url)) {
                                // notify the proper users
                                notify(page);
                                // add url to timer so users so not get notified of the restock every 10 seconds
                                let timer = Date.now() + 21600000;
                                timers.push({
                                    url: page.url,
                                    timer: timer
                                });
                            }
                        }
                    })
                    .catch(err => {
                        console.error(err)
                    });
            });
        });
        if (error) {
            // if there was a db error, wait for 10 minutes before trying again
            error = false;
            await sleep(600000);
        } else {
            // wait 10 seconds before checking again
            await sleep(15000);
        }
        // remove any items from timers that have been in there for longer than 6 hours
        for (let i = 0; i < timers.length; i++) {
            if (timers[i].timer < Date.now())
                timers.splice(i--, 1);
        }
    }
}

/**
 * Initial setup function
 * @param credentials - Credentials retrieved from credentials.json
 */
async function setup(credentials) {
    // initiate connection to the Mongo database
    await connectToDB(credentials.mongoURL);
    // initialize all events to be handled by Discord.JS
    await initDiscordEvents(credentials.token)
    // start checking websites
    await run();
}

/**
 * Initialize connection to the db
 * @param {String} url - URL of db
 */
const connectToDB = async (url) => {
    // connect to db
    console.log('Connecting to db...');
    await mongoose.connect(url, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('Successfully connected to db!');
    });
}

/**
 * Initialize Discord event handlers
 * @param token
 * @returns {Promise<void>}
 */
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
    setup(JSON.parse(content)).catch(e => {
        console.error(e);
        throw e;
    });
});