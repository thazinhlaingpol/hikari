const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema

const category = new Schema({
    
    categoryName: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
    
})

module.exports = mongoose.model("category", category);