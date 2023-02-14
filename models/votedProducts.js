const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
    username: String,
    theme: String,
    joke: String,
    point: {
        type: Number,
        default: 0
    },
    votedpoints:[{
        voteuser: String,
        votepoint: Number
    }]
});

module.exports = mongoose.model("Vote", productSchema);