const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema

const staff = new Schema({
    messengerID:{
        type: String,
        required: true
    },
    staffName: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("staff", staff);