const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema

const customer = new Schema({
    messengerID:{
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    phone: {
        type:String,
        requried: true
    },
    address: {
        type: String,
        required: true
    }

})

module.exports = mongoose.model("customer", customer);