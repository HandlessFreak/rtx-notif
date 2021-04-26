const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
    url: String,
    users: [
        String
    ]
});

module.exports = mongoose.model('Website', websiteSchema);