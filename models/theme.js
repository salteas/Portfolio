const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const themeSchema = new Schema({
    theme: String
});

module.exports = mongoose.model("Theme", themeSchema);