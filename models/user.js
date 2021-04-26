const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: String
});

module.exports = mongoose.model('User', userSchema);