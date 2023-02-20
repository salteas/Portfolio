const mongoose = require("mongoose");
const Vote = require("../models/votedProducts");
const Poll = require("../models/votedWorks");
const Theme = require("../models/theme");
const Title = require("../models/title");


mongoose.connect('mongodb://127.0.0.1:27017/oogiri', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log("MongoDB了解");
    })
    .catch(err => {
        console.log("MongoDBエラー");
        console.log(err)
    });

const jokeSeed = [
    {
        username: "青菜に盛り塩",
        theme: "「コーラ」を使って悲しい文章を作ってください",
        joke: "飾り付け"
    },
    {
        username: "きまぐれ",
        theme: "「コーラ」を使って悲しい文章を作ってください",
        joke: "まいたけの天ぷら"
    },
    {
        username: "おうか",
        theme: "「コーラ」を使って悲しい文章を作ってください",
        joke: "のーてんき"
    },
    {
        username: "とけつだいこん",
        theme: "「コーラ」を使って悲しい文章を作ってください",
        joke: "切株オバケ"
    },
    {
        username: "バームク",
        theme: "「コーラ」を使って悲しい文章を作ってください",
        joke: "草津温泉"
    },
    {
        username: "ファイアードラゴン",
        theme: "「コーラ」を使って悲しい文章を作ってください",
        joke: "ロッテリアの二枚舌外交"
    },
];

const votedJokes = [
    {
        username: "青菜に盛り塩",
        theme: "「コーラ」を使って悲しい文章を作ってください",
        joke: "飾り付け",
        point: 0,
        votedpoints:[]
    },
    {
        username: "きまぐれ",
        theme: "「コーラ」を使って悲しい文章を作ってください",
        joke: "まいたけの天ぷら",
        point: 0,
        votedpoints:[]
    },
    {
        username: "おうか",
        theme: "「コーラ」を使って悲しい文章を作ってください",
        joke: "のーてんき",
        point: 0,
        votedpoints:[]
    },
    {
        username: "とけつだいこん",
        theme: "「コーラ」を使って悲しい文章を作ってください",
        joke: "切株オバケ",
        point: 0,
        votedpoints:[]
    },
    {
        username: "バームク",
        theme: "「コーラ」を使って悲しい文章を作ってください",
        joke: "草津温泉",
        point: 0,
        votedpoints:[]
    },
    {
        username: "ファイアードラゴン",
        theme: "「コーラ」を使って悲しい文章を作ってください",
        joke: "ロッテリアの二枚舌外交",
        point: 0,
        votedpoints:[]
    },
];


const seedDB2 = async () => {
    await Vote.deleteMany({});
    await Poll.deleteMany({});
    for (let i = 0; i < votedJokes.length; i++) {
        const votedProducts = new Vote({
            username: `${votedJokes[i].username}`,
            theme: `${votedJokes[i].theme}`,
            joke: `${votedJokes[i].joke}`,
            point: votedJokes[i].point,
        });
        await votedProducts.save();
    }
};

const seedDB3 = async () => {
    await Theme.deleteMany({});
    const themeLists = new Theme({
        theme: "「コーラ」を使って悲しい文章を作ってください"
    });
    await themeLists.save();

    await Title.deleteMany({});
    const titleLists = new Title({
        title: "「ケチャップ」「水泳」を使って文章を作ってください" 
    });
    await titleLists.save();
};


seedDB2()
    .then(() => {
        seedDB3();
    })
    .then(() => {
        console.log("完了！");
    });