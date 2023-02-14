if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require("express");
const ejsMate = require("ejs-mate");
const path = require("path");
const ejs = require('ejs');
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
// const flash = require("connect-flash");

const Joke = require("./models/product");
const Vote = require("./models/votedProducts");
const Work = require("./models/work");
const Poll = require("./models/votedworks");
const Theme = require("./models/theme");
const Title = require("./models/title");
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/oogiri';
// 'mongodb://127.0.0.1:27017/oogiri'

const MongoStore = require('connect-mongo');

const secret = process.env.SECRET || 'keyboard cat';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret
    },
    touchAfter: 24 * 3600
  });

  store.on("error", e => {
    console.log("セッションストアエラー", e);
  });

const app = express();

app.use(cookieParser());

const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: false
};

app.use(session(sessionConfig));

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log("MongoDBオッケー");
    })
    .catch(err => {
        console.log("MongoDBエラー");
        console.log(err)
    })

app.use(flash());

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

app.use(express.static(path.join(__dirname, "public")));

mongoose.set('useFindAndModify', false);

app.get("/", async (req, res) => {
    const themes = await Theme.find({});
    const titles = await Title.find({});
    res.render("ogiri/home", { themes, titles, messages: req.flash("success"), error: req.flash("error") });
});

app.get("/oogiri/place/a/:id", async (req, res) => {

    const { id } = req.params;
    const themes = await Theme.findById(id);
    const jokes = await Joke.find({theme: themes.theme});
    res.render("ogiri/separatePlace", { jokes, themes, messages: req.flash("success") });
});

app.get("/oogiri/place/b/:id", async (req, res) => {
    const { id } = req.params;
    const titles = await Title.findById(id);
    const works = await Work.find({title: titles.title});
    res.render("ogiri/separatePlaceb", { works, titles, messages: req.flash("success") });
});


app.patch("/oogiri/place/a/:id", async (req, res) => {
    const { username, joke } = req.body;
    const { id } = req.params;
    const themes = await Theme.findById(id);
    const votedProducts = await Vote.find({theme: themes.theme});
    const joinUserName = [];
    for (let votedProduct of votedProducts) {
        joinUserName.push(votedProduct.username);
    }
    if (joinUserName.includes(username)) {
        await Joke.findOneAndUpdate({ username: username, theme: themes.theme }, { joke: joke });
        await Vote.findOneAndUpdate({ username: username, theme: themes.theme }, { joke: joke });
        req.flash("success", "投稿内容が変更されました");
        res.redirect("/");
    } else {
        const products = new Joke({ username, joke, theme: themes.theme });
        await products.save();
        const votedProducts = new Vote({ username, joke, theme: themes.theme });
        await votedProducts.save();

        req.flash("success", "投稿されました");
        res.redirect("/");
    }
});

app.patch("/oogiri/place/b/:id", async (req, res) => {
    const { username, joke } = req.body;
    const { id } = req.params;
    const titles = await Title.findById(id);
    const polledProducts = await Poll.find({title: titles.title});
    const joinUserName = [];
    for (let polledProduct of polledProducts) {
        joinUserName.push(polledProduct.username);
    }
    if (joinUserName.includes(username)) {
        await Work.findOneAndUpdate({ username: username, title: titles.title }, { joke: joke });
        await Poll.findOneAndUpdate({ username: username, title: titles.title }, { joke: joke });
        req.flash("success", "投稿内容が変更されました");
        res.redirect("/");
    } else {
        const products = new Work({ username, joke, title: titles.title });
        await products.save();
        const polledProducts = new Poll({ username, joke, title: titles.title });
        await polledProducts.save();

        req.flash("success", "投稿されました");
        res.redirect("/");
    }
});

app.get("/oogiri/vote/a/:id", async (req, res) => {
    const { id } = req.params;
    const themes = await Theme.findById(id);
    const products = await Joke.find({theme: themes.theme});
    const votedProducts = await Vote.find({theme: themes.theme});
    function shuffle(array) {
        for (let t = array.length - 1; t >= 0; t--) {
            const randomCount = Math.floor((Math.random() * (t + 1)));
            [array[t], array[randomCount]] = [array[randomCount], array[t]];
        }
        return array;
    }
    const shuffleProduct = shuffle(products);
    await Joke.deleteMany({});
    await Joke.insertMany(shuffleProduct);
    res.render("ogiri/vote", { shuffleProduct, votedProducts, themes });
});

app.patch("/oogiri/vote/a/:id", async (req, res) => {
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

app.get("/oogiri/vote/b/:id", async (req, res) => {
    const { id } = req.params;
    const titles = await Title.findById(id);
    const polledProducts = await Poll.find({title: titles.title});
    const products = await Work.find({title: titles.title});
    function shuffle(array) {
        for (let t = array.length - 1; t >= 0; t--) {
            const randomCount = Math.floor((Math.random() * (t + 1)));
            [array[t], array[randomCount]] = [array[randomCount], array[t]];
        }
        return array;
    }
    const shuffleProduct = shuffle(products);
    await Work.deleteMany({});
    await Work.insertMany(shuffleProduct);
    res.render("ogiri/voteb", { shuffleProduct, polledProducts, titles });
});



app.patch("/oogiri/vote/b/:id", async (req, res) => {
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

app.get("/oogiri/result/a/:id", async (req, res) => {
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

app.get("/oogiri/result/b/:id", async (req, res) => {
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

app.get("/oogiri/result/a/user/:id", async (req, res) => {
    const { id } = req.params;
    const user = await Vote.findById(id);
    const allUser = await Vote.find({theme: user.theme});
    res.render("ogiri/jokeresult", { allUser, user });
});

app.get("/oogiri/result/b/user/:id", async (req, res) => {
    const { id } = req.params;
    const user = await Poll.findById(id);
    const allUser = await Poll.find({title: user.title});
    res.render("ogiri/jokeresultb", { allUser, user });
});

app.get("/oogiri/past", async (req, res) => {
    const pastThemes = await Theme.find({});
    const pastTitles = await Title.find({});

    res.render("ogiri/pasttitle", { pastThemes, pastTitles });
});

app.get("/admin/titlecast", (req, res) => {

    res.render("ogiri/admin");
});

app.post("/admin/titlecast", async (req, res) => {
    const { theme, title } = req.body;
    const themes = new Theme({ theme });
    await themes.save();
    const titles = new Title({ title, });
    await titles.save();

    res.redirect("/admin/titlecast");
});

app.all("*", (req, res, next) => {
    next(new ExpressError("ページが見つかりませんでした", 404));
});

app.listen(3000, () => {
    console.log("ポート3000で待機中");
});