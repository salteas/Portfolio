const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workSchema = new Schema({
    username: String,
    title: String,
    joke: String
});

module.exports = mongoose.model("Work", workSchema);