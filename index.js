/**
 * Join link
 * https://discord.com/api/oauth2/authorize?client_id=794431055721267212&permissions=84992&scope=bot
 * @type {module:"discord.js"}
 */

const Discord = require('discord.js'),
    axios = require('axios'),
    cheerio = require('cheerio'),
    client = new Discord.Client(),
    fs = require('fs');

const members = [],
    watchlist = [];

// get Discord token from credentials.json and store in credentials object
let credentials;
fs.readFileSync('credentials.json', (err, content) => {
    if (err) return console.error('No credentials found', err);
    credentials = JSON.parse(content);
});

// login to discord
client.login(credentials.token);

/**
 * Sleep function to sleep for a specified amount of time.
 * @param {int} milliseconds - How long to sleep for
 * @returns - Promise to sleep for the specified amount of time
 */
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

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
 * Add a new user to the list of users to be notified
 * @param author - User to be added to list of people to be notified
 * @returns True if user is not already on the list
 */
const addMember = (author) => {
    if (members.some(member => member.toString() == author.toString())) return false;
    members.push(author);
    return true;
}

/**
 * Remove the specified user of the list of people to be notified
 * @param author User to be removed
 * @returns True if removed, false if not on list
 */
const removeMember = (author) => {
    if (!members.some(member => member.toString() == author.toString())) return false;
    members.splice(members.indexOf(author), 1);
    return true;
}

/**
 * Handles a new message in an included server the bot is already in
 */
client.on('message', message => {
    // if the message is not a command or is sent by a bot, ignore the message
    if (!message.content.startsWith('!') || message.author.bot) return;
    // remove the '!' at the beginning of the command
    let command = message.content.toLowerCase().slice(1).trim();
    switch (command) {
        // add message author to list of people to be notified
        case 'notifyme':
            if (addMember(message.author)) {
                message.channel.send('Successfully added ' + message.author.toString());
            } else {
                message.channel.send('You are already on the notification list.');
            }
            break;
        // remove message author from list of people to be notified
        case 'removeme':
            if (removeMember(message.author)) {
                message.channel.send('Successfully removed ' + message.author.toString());
            } else {
                message.channel.send('You are not on the notification list.');
            }
            break;
        // show the help message for a list of commands
        case 'rtxhelp':
            message.channel.send('===Commands===\n!RTXhelp -> Show this menu\n!notifyMe -> I will send you a DM when an item is in stock\n!removeMe -> I will not longer send you a DM when an item is in stock\n!addPage -> I will check if the given item is in stock\n\nNOTE: I am only capable of checking Best Buy stock.')
            break;
        default:
            // add a new URL to list of pages to watch
            if (command.startsWith('addpage')) {
                const url = message.content.toLowerCase().slice(8).trim();
                if (url.length <= 0) {
                    message.channel.send('Invalid link.');
                    break;
                }
                watchlist.push(url);
                message.channel.send('Webpage successfully added.');
            } else {
                message.channel.send('Command not recognized.');
            }
            break;
    }
});

client.once('ready', () => {
    console.log('Running...');
});

/**
 * Function to loop and check for a product coming in stock
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

run();