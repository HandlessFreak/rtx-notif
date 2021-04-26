const Discord = require('discord.js'),
    mongoose = require('mongoose'),
    Website = require('../models/Website');

module.exports.handleCommand = async (client, message, command) => {

}

/**
 * Command which returns a list of all pages being currently watched for the given user
 * @param {Discord.Client} client - Discord client object
 * @param {Discord.Message} message - Message containing the command
 */
module.exports.myPages = async (client, message) => {
    // find all pages currently being watched for the message author
    await Website.find({"users": message.author.id}, (err, results) => {
        if (err) {
            message.channel.send(message.author.toString() + " I had some trouble finding which pages I am watching for you. Either something went wrong on my end, or I am not watching any pages for you right now.");
            return console.error("Error finding user's entries", err);
        }
        // add each url to an output string
        let output = message.author.toString() + " These are the pages I am currently watching for you:";
        let i = 1;
        results.forEach(page => {
            output += "\n\n" + i++ + " -> " + page.url;
        });
        // send the output string as a message
        message.channel.send(output);
    });
}

/**
 * Adds the user to the list of users watching the specific page.
 * @param {Discord.Client} client - Discord client object
 * @param {Discord.Message} message - Message containing the command
 * @param {String} url - URL to be added
 */
module.exports.addPage = async (client, message, url) => {
    await Website.findOne({url: url}, async (err, res) => {
        // if there was an error, handle it
        if (err) {
            await message.channel.send(message.author.toString() + " Something went wrong on my end! If the issue persists, let my creator know.");
            return console.error("Error retrieving url " + url + " from DB: ", err);
        }
        // if the user is already watching the URL, return null
        if (res.users.some(uid => uid === message.author.id))
            url = null
        else {
            // add user ID to the res
            res.users.push(message.author.id);
            // update database entry
            await Website.findByIdAndUpdate(res._id, res, err => {
                if (err) return console.error("Updating user in db: ", err);
            });
        }
    });
    if (url)
        await message.channel.send(message.author.toString() + " I will let you know when that product comes in stock!");
    else
        await message.channel.send(message.author.toString() + " I am already notifying you when that product comes in stock. Try !myPages to see what else I am watching for you.");
}