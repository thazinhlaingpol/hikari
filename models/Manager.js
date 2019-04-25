const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema

const maanger = new Schema({
    maangerID: {
        type: String,
        required: true
    },
    managerName: {
        type: String,
        required: true
    },
    confirmCode: {
        type: String,
        required: true
    }

})

module.exports = mongoose.model("manager", maanger);