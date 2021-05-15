require('dotenv').config();
const express = require('express');
var mongoose = require('mongoose');
const cors = require('cors');
const shortid = require('shortid');
const bodyParser = require('body-parser');
const app = express();


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

var ShortURL = mongoose.model('ShortURL', new mongoose.Schema({
  short_url: String,
  original_url: String,
  short: String
}))

app.use(bodyParser.urlencoded({extended : false}))

app.use(bodyParser.json())

app.post("/api/shorturl/new/", function(req, res){
  let clientReqURL = req.body.url;
  let short = shortid.generate();
  let newShortURL = short

  console.log(clientReqURL);

  let newURL = new ShortURL({
    short_url: __dirname + "/api/shorturl/" + short,
    original_url: clientReqURL,
    short: short
  });

  newURL.save(function(err,doc){
    if(err)
      return console.log(err);
    console.log(newURL);
    res.json({
      "saved": true,
      "short_url": newURL.short_url,
      "original_url": newURL.original_url,
      "short": newURL.short
    });
  });
});


app.get("/api/shorturl/:short", function(req, res){
  let generatedShort = req.params.short;
  ShortURL.find({short: generatedShort}).then(function(foundUrls){
    let urlForRedirect = foundUrls[0];
    res.redirect(urlForRedirect.original_url);
  });
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
