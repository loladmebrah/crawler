const express = require('express');
const request = require('request');
const cors = require('cors');
const cheerio = require('cheerio');
const URL = require('url').URL;

request.prototype.request = function () {
  var self = this
  self.EventEmitter.defaultMaxListeners = 30;
  self.setMaxListeners(0);
}

const app = express();

var whitelist = ['http://localhost:8050','http://localhost:8100'];

var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) callback(null, true);
    else callback(new Error('Not allowed by CORS, try again'));
  }
}

app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-type, Accept')
  next();
});

app.get('/scrape/*', (req, res) => {
  let url_ = req.params[0];
  if(url_!== "/") makeRequest(url_, res);
  else res.status(200).send("Write an url YOU FOOL");
});

function makeRequest(url_, res){
  console.log("parsing", [url_]);
  request({url: url_, rejectUnauthorized: false}, (error, response, body) => {
      if (error || response.statusCode !== 200) 
        return res.status(500).json({ type: 'error', message: error.message });
      return processPage(body,url_).then((result)=>{
        console.log("Final array",result);
        return res.status(200).json({data: result});
      }).catch((err)=>{
        console.log("Error catched", err);
        return res.status(400).json({error: err });
      });
      
    }
  )
}

function processPage(body, originUrl){
  return new Promise((resolve, reject)=>{
    console.log("Processing "+originUrl, body);
    if(body!= undefined && body!= null){
      $ = cheerio.load(body);
      links = $('a');
      let array = [];
      $(links).each(function(i, link){
        var href = $(link).attr('href');
        let hostname = (new URL(originUrl)).hostname;
        console.log("href "+href, "hostname "+hostname);
        if(sanitizeRef(href, hostname)) {
          if( href.indexOf(hostname)!==-1 || href.indexOf('http')!==-1 ) 
            array.push(href);
          else 
            array.push(hostname+href);
        }
      });
      resolve(array);
    }else
      reject("No body found");
      
  });
}

function sanitizeRef(ref, hostname){
  if(typeof ref == 'string'){
    if(checkValidExtension(ref)) 
      return true;
    else if(checkIfRunnable(ref) && hasSemiValidDomain(ref, hostname)) 
      return true;
    else 
      return false;
  }
}

function hasSemiValidDomain(ref, hostname){
  return (ref.indexOf(hostname)!== -1 || ref.indexOf('http') === -1);
}

function checkValidExtension(ref){
  console.log("checking ref "+ref, ref.indexOf('.pdf') !== -1);
  return ref.indexOf('.pdf') !== -1;
}

function checkIfRunnable(r){
  return r.indexOf('?') !== -1 && !checkInvalidExtension(r);
}

function checkInvalidExtension(ref){
  return ref.match( /(asp|php|jsp)/ );
}

const PORT = process.env.PORT || 4200;
app.listen(PORT, () => console.log(`listening on ${PORT}`));