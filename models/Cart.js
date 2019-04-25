const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create Schema

const cart = new Schema({
    messengerID: {
        type: String,
        required: true
    },
    productID: {
        type: String,
        required: true
    },
    totalQty: {
        type: Number,
        required: true
    }
    
})

module.exports = mongoose.model("cart", cart);