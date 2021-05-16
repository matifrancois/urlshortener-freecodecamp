require('dotenv').config();
const express = require('express');
var mongoose = require('mongoose');
const cors = require('cors');
const shortid = require('shortid');
const bodyParser = require('body-parser');
const app = express();

// connect to the database
mongoose 
 .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,   })   
 .then(() => console.log("Database connected!"))
 .catch(err => console.log(err));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended : false}))
app.use(bodyParser.json())

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const urlSchema = new mongoose.Schema({
  short_url: String,
  original_url: String,
  short: String
});

// create the model
var ShortURL = mongoose.model('ShortURL', urlSchema)

app.post("/api/shorturl/", function(req, res){
  let clientReqURL = req.body.url;

  if (!isvalidURL(clientReqURL)) 
    return res.json({ error: 'invalid url' });

  let short = shortid.generate();

  let newURL = new ShortURL({
    short_url: "/api/shorturl/" + short,
    original_url: clientReqURL,
    short: short
  });

  console.log("The requested url is:", newURL.original_url);
  console.log("The short part added will be:", newURL.short);
  console.log("The short url will be:", newURL.short_url);

  SaveURL(newURL, res, responsefunction);
  // now store it on the database
  // newURL.save(function(err,doc){
  //   if(err)
  //     return console.log(err);
  //   console.log(newURL);
    
  // });
});



const SaveURL = function(newURLObject, res, response){
	newURLObject.save((error, data) => {
		if(error){
			return console.log(error);
		}else{
			console.log("save successful")
      response(newURLObject, res);
		}
	});
};

const responsefunction = function(newURL, res){
  res.json({
    "saved": true,
    "short": newURL.short_url,
    "original_url": newURL.original_url,
    "short_url": newURL.short
  });
}



app.get("/api/shorturl/:short", function(req, res){
  let generatedShort = req.params.short;
  ShortURL.find({short: generatedShort})
          .then(function(foundUrls){
            let urlForRedirect = foundUrls[0];
            res.redirect(urlForRedirect.original_url);
          });
});


function isvalidURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return pattern.test(str);
}


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
