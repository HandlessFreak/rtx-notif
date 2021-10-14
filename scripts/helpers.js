
/**
 * Prints to the console with proper timestamps
 * @param message
 * @param err
 * @returns {string|void}
 */
module.exports.formattedPrint = (message, err) => {
    if (err)
        return console.error("[" + new Date().toLocaleString() + "]: " + message, err);
    else
        return console.log("[" + new Date().toLocaleString() + "]: " + message);
}