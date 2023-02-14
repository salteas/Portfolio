const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pollSchema = new Schema({
    username: String,
    title: String,
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

module.exports = mongoose.model("Poll", pollSchema);