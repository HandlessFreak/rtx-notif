const Discord = require('discord.js'),
    mongoose = require('mongoose'),
    Website = require('../models/Website');

/**
 * Command which returns a list of all pages being currently watched for the given user
 * @param {Discord.Client} client - Discord client object
 * @param {Discord.Message} message - Message containing the command
 */
module.exports.myPages = async (client, message) => {
    // get a list of all entries containing the message author and assign the array of URLs to pages
    const pages = await Website.find({"users": message.author.id}, (err, results) => {
        if (err) return console.error("Error finding user's entries", err);
        const urls = [];
        results.forEach(page => {
            urls.push(page.url);
        });
        return results;
    });
}

/**
 * Adds the user to the list of users watching the specific page.
 * @param {Discord.Client} client - Discord client object
 * @param {Discord.Message} message - Message containing the command
 * @param {String} url - URL to be added
 * @returns {String} URL which was added, or null if user is already watching the page
 */
module.exports.addPage = async (client, message, url) => {
    await Website.findOne({url: url}, async (err, res) => {
        // if there was an error, handle it
        if (err)
            return console.error("Error retrieving url " + url + " from DB: ", err);
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
    return url;
}