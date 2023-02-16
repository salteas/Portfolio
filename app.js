if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const ejsMate = require("ejs-mate");
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");

const Theme = require("./models/theme");
const Title = require("./models/title");
const ThemesRoutes = require("./routes/themes");
const TitlesRoutes = require("./routes/titles");

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/oogiri';

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
    res.locals.messages = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use(express.static(path.join(__dirname, "public")));
mongoose.set('useFindAndModify', false);


app.get("/", async (req, res) => {
    const themes = await Theme.find({});
    const titles = await Title.find({});
    res.render("oogiri/home", { themes, titles});
});

app.use("/oogiri", ThemesRoutes);
app.use("/oogiri", TitlesRoutes);

app.get("/oogiri/past", async (req, res) => {
    const pastThemes = await Theme.find({});
    const pastTitles = await Title.find({});
    res.render("oogiri/pasttitle", { pastThemes, pastTitles });
});

app.get("/admin/titlecast", (req, res) => {
    res.render("oogiri/admin");
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

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`ポート${port}で待機中`);
});