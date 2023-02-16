const express = require("express");
const router = express.Router();
const Poll = require("./models/votedWorks");
const Title = require("./models/title");

router.get("/place/b/:id", async (req, res) => {
    const { id } = req.params;
    const titles = await Title.findById(id);
    const polls = await Poll.find({title: titles.title});
    res.render("ogiri/separatePlaceb", { polls, titles, messages: req.flash("success") });
});

router.patch("/place/b/:id", async (req, res) => {
    const { username, joke } = req.body;
    const { id } = req.params;
    const titles = await Title.findById(id);
    const polledProducts = await Poll.find({title: titles.title});
    const joinUserName = [];
    for (let polledProduct of polledProducts) {
        joinUserName.push(polledProduct.username);
    }
    if (joinUserName.includes(username)) {
        await Poll.findOneAndUpdate({ username: username, title: titles.title }, { joke: joke });
        req.flash("success", "投稿内容が変更されました");
        res.redirect("/");
    } else {
        const polledProducts = new Poll({ username, joke, title: titles.title });
        await polledProducts.save();

        req.flash("success", "投稿されました");
        res.redirect("/");
    }
});

router.get("/vote/b/:id", async (req, res) => {
    const { id } = req.params;
    const titles = await Title.findById(id);
    const polledProducts = await Poll.find({title: titles.title});
    function shuffle(array) {
        for (let t = array.length - 1; t >= 0; t--) {
            const randomCount = Math.floor((Math.random() * (t + 1)));
            [array[t], array[randomCount]] = [array[randomCount], array[t]];
        }
        return array;
    }
    const shuffleProduct = shuffle(polledProducts);
    await Poll.deleteMany({});
    await Poll.insertMany(shuffleProduct);
    res.render("ogiri/voteb", { shuffleProduct, polledProducts, titles });
});

router.patch("/vote/b/:id", async (req, res) => {
    const polluser = req.body.username;
    const { id } = req.params;
    const titles = await Title.findById(id);
    const polledProducts = await Poll.find({title: titles.title});
    const pollusers = polledProducts[0].votedpoints;
    const pollUserName = [];
    const pollpoint = Object.values(req.body);
    for (let polluser of pollusers) {
        pollUserName.push(polluser.voteuser);
    }
    if (pollUserName.includes(polluser)) {
        req.flash("error", "あなたはすでに投票しています");
        res.redirect("/");
    } else if (pollpoint.indexOf("2") !== -1 || pollpoint.indexOf("3") !== -1 || pollpoint.indexOf("4") !== -1) {
        for (let i = 0; i < polledProducts.length; i++) {
            polledProducts[i].point = polledProducts[i].point + parseInt(pollpoint[i]);
            polledProducts[i].votedpoints.push({ voteuser: polluser, votepoint: parseInt(pollpoint[i]) });
        }
        await Poll.deleteMany({});
        await Poll.insertMany(polledProducts);
        req.flash("success", "投票が完了しました");
        res.redirect("/");
    } else {
        req.flash("error", "すべて0票で投票されています");
        res.redirect("/");
    }
});

router.get("/result/b/:id", async (req, res) => {
    const { id } = req.params;
    const titles = await Title.findById(id);
    const polledProducts = await Poll.find({title: titles.title});
    const sortLists = polledProducts.sort(function (a, b) {
        if (a.point > b.point) {
            return -1;
        } else if (a.point < b.point) { return 1; } else { return 0; }
    });
    res.render("ogiri/resultb", { sortLists, titles });
});

router.get("/result/b/user/:id", async (req, res) => {
    const { id } = req.params;
    const user = await Poll.findById(id);
    const allUser = await Poll.find({title: user.title});
    res.render("ogiri/jokeresultb", { allUser, user });
});

module.exports = router;