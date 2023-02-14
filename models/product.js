const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
    username: String,
    theme: String,
    joke: String
});

module.exports = mongoose.model("Joke", productSchema);
