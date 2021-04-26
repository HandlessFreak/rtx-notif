const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
    url: String,
    users: [{
        type: String
    }]
});

module.exports = mongoose.model('Website', websiteSchema);