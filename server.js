require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const validUrl = require("valid-url");
const shortid = require("shortid");
const mongoose = require("mongoose");
const cors = require("cors");
const env = require("dotenv");
const app = express();

env.config({
  path: "sample.env",
});

//npm install mongoose
mongoose.connect(
  process.env.MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("DB connected correctly");
  }
);
mongoose.connection.on("error", (err) => {
  console.log("error connected DB");
});

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/api/shorturl/:url", async (req, res) => {
  let shortUrl = req.params.url;
  let response = await UrlModel.findOne({ shortUrl });
  res.redirect(response.url);
});

app.post("/api/shorturl", async (req, res) => {
  let url = req.body.url;
  if (validUrl.isUri(url)) {
    let response = await UrlModel.findOne({ url });
    if (response) {
      return res.json({
        url: response.url,
        short_url: response.shortUrl,
      });
    } else {
      let short_url_code = shortid.generate(url);
      let newShortUrl = UrlModel({ url, shortUrl: short_url_code });
      let newRes = await newShortUrl.save();
      return res.json({ original_url: newRes.url, short_url: newRes.shortUrl });
    }
  } else {
    return res.json({ error: "invalid url" });
  }
});

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

let ShortUrlSchema = new mongoose.Schema({
  url: mongoose.Schema.Types.String,
  shortUrl: mongoose.Schema.Types.String,
});

let UrlModel = mongoose.model("Url", ShortUrlSchema);
