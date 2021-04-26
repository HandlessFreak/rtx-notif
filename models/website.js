const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
    url: String,
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = mongoose.model('Website', websiteSchema);