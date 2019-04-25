const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema

const order = new Schema({
    orderID:{
        type: String,
        required: true
    },
    messengerID: {
        type: String,
        required: true
    },
   
    date: {
        type: Date,
        required: true
    },
    products: {
        type: Array,
        required: true
    }
})

module.exports = mongoose.model("order", order);