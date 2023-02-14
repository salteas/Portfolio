const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const titleSchema = new Schema({
    title: String
});

module.exports = mongoose.model("Title", titleSchema);