const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema

const managerMessenger = new Schema({
    messengerID: {
        type: String,
        required: true
    },
    managerID: {
        type: String,
        required: true
    }

})

module.exports = mongoose.model("managerMessenger", managerMessenger);