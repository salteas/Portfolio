const express = require("express");
const router = express.Router();
const Vote = require("../models/votedProducts");
const Theme = require("../models/theme");

router.get("/place/a/:id", async (req, res) => {
    const { id } = req.params;
    const themes = await Theme.findById(id);
    const votes = await Vote.find({theme: themes.theme});
    res.render("ogiri/separatePlace", { votes, themes});
});

router.patch("/place/a/:id", async (req, res) => {
    const { username, joke } = req.body;
    const { id } = req.params;
    const themes = await Theme.findById(id);
    const votedProducts = await Vote.find({theme: themes.theme});
    const joinUserName = [];
    for (let votedProduct of votedProducts) {
        joinUserName.push(votedProduct.username);
    }
    if (joinUserName.includes(username)) {
        await Vote.findOneAndUpdate({ username: username, theme: themes.theme }, { joke: joke });
        req.flash("success", "投稿内容が変更されました");
        res.redirect("/");
    } else {
        const votedProducts = new Vote({ username, joke, theme: themes.theme });
        await votedProducts.save();

        req.flash("success", "投稿されました");
        res.redirect("/");
    }
});

router.get("/vote/a/:id", async (req, res) => {
    const { id } = req.params;
    const themes = await Theme.findById(id);
    const votedProducts = await Vote.find({theme: themes.theme});
    function shuffle(array) {
        for (let t = array.length - 1; t >= 0; t--) {
            const randomCount = Math.floor((Math.random() * (t + 1)));
            [array[t], array[randomCount]] = [array[randomCount], array[t]];
        }
        return array;
    }
    const shuffleProduct = shuffle(votedProducts);
    await Vote.deleteMany({});
    await Vote.insertMany(shuffleProduct);
    res.render("ogiri/vote", { shuffleProduct, votedProducts, themes });
});

router.patch("/vote/a/:id", async (req, res) => {
    const voteduser = req.body.username;
    const { id } = req.params;
    const themes = await Theme.findById(id);
    const votedProducts = await Vote.find({theme: themes.theme});
    const voteusers = votedProducts[0].votedpoints;
    const voteUserName = [];
    const votepoint = Object.values(req.body);
    for (let voteuser of voteusers) {
        voteUserName.push(voteuser.voteuser);
    }
    if (voteUserName.includes(voteduser)) {
        req.flash("error", "あなたはすでに投票しています");
        res.redirect("/");
    } else if (votepoint.indexOf("2") !== -1 || votepoint.indexOf("3") !== -1 || votepoint.indexOf("4") !== -1) {
        for (let i = 0; i < votedProducts.length; i++) {
            votedProducts[i].point = votedProducts[i].point + parseInt(votepoint[i]);
            votedProducts[i].votedpoints.push({ voteuser: voteduser, votepoint: parseInt(votepoint[i]) });
        }
        await Vote.deleteMany({});
        await Vote.insertMany(votedProducts);
         req.flash("success", "投票が完了しました");
        res.redirect("/");
    } else {
        req.flash("error", "すべて0票で投票されています");
        res.redirect("/");
    }
});

router.get("/result/a/:id", async (req, res) => {
    const { id } = req.params;
    const themes = await Theme.findById(id);
    const votedProducts = await Vote.find({theme: themes.theme});
    const sortLists = votedProducts.sort(function (a, b) {
        if (a.point > b.point) {
            return -1;
        } else if (a.point < b.point) { return 1; } else { return 0; }
    });
    res.render("ogiri/result", { sortLists, themes });
});

router.get("/result/a/user/:id", async (req, res) => {
    const { id } = req.params;
    const user = await Vote.findById(id);
    const allUser = await Vote.find({theme: user.theme});
    res.render("ogiri/jokeresult", { allUser, user });
});

module.exports = router;