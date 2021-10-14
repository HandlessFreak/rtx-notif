const Discord = require('discord.js'),
    mongoose = require('mongoose'),
    Website = require('../models/Website'),
    helpers = require('./helpers');

/**
 * Given a message, parses the command and executes it.
 * @param {Discord.Message} message - Message containing the command
 */
module.exports.handleCommand = async (message) => {
    const command = message.content.toLowerCase().slice(1).trim();
    switch (command) {
        // if the command does not contain/need any args
        case 'mypages':
            await myPages(message);
            break;
        case 'rtxhelp':
            await rtxHelp(message);
            break;
        case "info":
            await info(message);
            break;
        default:
            if (command.startsWith('addpage'))
                await addPage(message, command.slice(8).trim());
            else if (command.startsWith('removepage'))
                await removePage(message, parseInt(command.slice(11).trim()));
            break;
    }
}

/**
 * Prints info about the bot for the user, such as the GitHub and donations.
 * TODO: implement info command
 * @param {Discord.Message} message - Message containing the command
 */
const info = async message => {
    await message.channel.send("I am but a simple Discord bot created by a college kid who wanted to get his hands on a 3070."
        + " My code is linked in the GitHub repo below if you are interested."
        + " Additionally, if you want to support my creator, you can buy him a coffee or help him through college."
        + " Happy RTX hunting!"
        + "\nHis Venmo: @pb4000\nMy code: https://github.com/HandlessFreak/rtx-notif");
}

/**
 * Prints a list of commands for the user
 * @param {Discord.Message} message - Message containing the command
 */
const rtxHelp = async message => {
    await message.channel.send("===Commands==="
        + "\n\n!RTXhelp -> Display this menu."
        + "\n\n!myPages -> Displays a numbered list of the pages I am currently watching for you."
        + "\n\n!addPage [url] -> I will notify you when the product at [url] comes in stock."
        + "\n\n!removePage [number] -> I will stop watching the specified page for you. [number] corresponds to the URL shown by !myPages."
        + "\n\n!info -> Display some information about me and my creator.");
}

/**
 * Command which returns a list of all pages being currently watched for the given user
 * @param {Discord.Message} message - Message containing the command
 */
const myPages = async (message) => {
    // find all pages currently being watched for the message author
    await Website.find({"users": message.author.id}, (err, results) => {
        if (err) {
            message.channel.send(message.author.toString() + " I had some trouble finding which pages I am watching for you. Either something went wrong on my end, or I am not watching any pages for you right now.");
            return helpers.formattedPrint("Error finding user's entries", err);
        }
        if (results.length === 0)
            return message.channel.send(message.author.toString() + " I am not currently watching any products for you.");
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
 * @param {Discord.Message} message - Message containing the command
 * @param {String} url - URL to be added
 */
const addPage = async (message, url) => {
    if (url.trim().length === 0)
        return message.channel.send(message.author.toString() + " That is not a valid URL.");
    await Website.findOne({url: url}, async (err, res) => {
        // if there was an error, handle it
        if (err) {
            await message.channel.send(message.author.toString() + " Something went wrong on my end! If the issue persists, let my creator know.");
            return helpers.formattedPrint("Error retrieving url " + url + " from DB: ", err);
        }
        // if the url is already in the db
        if (res) {
            // if the user is already watching the URL, return null
            if (res.users.some(uid => uid === message.author.id))
                url = null
            else {
                // add user ID to the res
                res.users.push(message.author.id);
                // update database entry
                await Website.findByIdAndUpdate(res._id, res, err => {
                    if (err) {
                        message.channel.send(message.author.toString() + " I had some trouble adding you to the database. If the issue persists, let my creator know.");
                        return helpers.formattedPrint("Updating user in db: ", err);
                    }
                });
            }
        } else {
            // if the url is not already in the db, add it
            await Website.create({
                url: url,
                users: [
                    message.author.id
                ]
            }, err => {
                if (err) {
                    message.channel.send(message.author.toString() + " I had some trouble adding this page to my database. If the issue persists, let my creator know.");
                    return helpers.formattedPrint("Error creating new entry in db: ", err);
                }
            });
        }
    });
    if (url)
        await message.channel.send(message.author.toString() + " I will let you know when that product comes back in stock!");
    else
        await message.channel.send(message.author.toString() + " I am already notifying you when that product comes in stock. Try !myPages to see what else I am watching for you.");
}

/**
 * Removes the user from the list of people to be notified of the given number
 * @param {Discord.Message} message
 * @param {Number} num
 */
const removePage = async (message, num) => {
    // get a list of all websites the user is being notified of
    Website.find({"users": message.author.id}, async (err, results) => {
        if (err) {
            await message.channel.send(message.author.toString() + " I had some trouble finding which pages I am watching for you. Either something went wrong on my end, or I am not watching any pages for you right now.");
            return helpers.formattedPrint("Error finding user's entries", err);
        }
        if (!results[num - 1])
            return message.channel.send(message.author.toString() + " Either I am not currently watching any pages for you or this is an invalid number.");
        // remove the user from the list for the website
        results[num - 1].users.pop(message.author.id);
        if (results[num - 1].users.length === 0)
            // if there is no one being notified for this webpage, remove the webpage from the db
            await Website.findByIdAndDelete(results[num - 1]._id, err => {
                if (err) {
                    message.channel.send(message.author.toString() + ' I had some trouble completing this request in my database. If the issue persists, let my creator know.');
                    return helpers.formattedPrint("Error deleting website from db: ", err);
                } else {
                    message.channel.send(message.author.toString() + ' You will no longer be notified of this product!');
                }
            });
        else
            // update the entry in the db with the removal of the user
            await Website.findByIdAndUpdate(results[num - 1]._id, results[num - 1], err => {
                if (err) {
                    message.channel.send(message.author.toString() + ' I had some trouble completing this request in my database. If the issue persists, let my creator know.');
                    return helpers.formattedPrint("Error updating entry in db: ", err);
                } else {
                    message.channel.send(message.author.toString() + ' You will no longer be notified of this product!');
                }
            });
    });
}