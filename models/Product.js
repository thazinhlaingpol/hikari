const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema

const product = new Schema({
    productID: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    categoryName: {
        type: String,
        required: false
    },
    stock: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model("product", product);