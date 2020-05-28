/* Graphics-magic on-fly resizer (c) 2020 Pavel Vasev
   
   Updates:
   2020-05 * return 404 if source file not found, including exlusion of [nn] suffix
           * fix trailing slash issue
   
*/

var gm = require('gm');
var mime = require('mime-types');
const http = require('http');
const port = parseInt( process.env.RESIZER_PORT || "3001" );
const iface = process.env.RESIZER_BIND || "127.0.0.1";
const fs = require('fs');

//////////////////////////////////////////////// transformsrc function
// transformsrc(input) => object for gm constructor, (string | stream)
// one can replace transformsrc with request.get(input) for remote files
// dont forget to use HTTP_PROXY + nginx caching in that case

var filedir = process.env.RESIZER_DIR || "/var/www/";
if (filedir.length < 5) throw `filedir=${filedir} too short!`
if (filedir[ filedir.length-1 ] != "/") filedir = filedir+"/";

function sanitize(input) {
  return input.replace(/[^a-zA-Z0-9\.\-_\/\[\],]/g,"").replace(/\.\./g,"").replace(/\/\/+/g,"/").substring(0,255);
  // 2020-01-02 added [] so may specify gif's frame number
}

function transformsrc(input) { 
  return filedir + sanitize(input);
}

//////////////////////////////////////////////// startup

console.log("************************* resizer code start",(new Date()).toTimeString());

// console.log("filedir=",filedir);
// console.log("transformsrc test:",transformsrc("../../..///some/path/???//dev/null/mypicture-33_22_cc$.png"));

//////////////////////////////////////////////// image functions

function gmfit(req,res,cmd,w,h,src) {
    return gm(src)
	.resize(w, h,">") // actually this is resize_to_fit
	.stream().pipe(res);
}

function gmcrop(req,res,cmd,w,h,src) {
    return gm(src)
	.resize(w,h,"^") // http://www.graphicsmagick.org/GraphicsMagick.html#details-geometry
	.gravity('Center')
	.crop(w, h)
	.stream().pipe(res);
}

function gmcroputl(req,res,cmd,w,h,src) {
      gm(src).size(function(err, value){
        console.log("this is crop-unless-too-long");
        console.log("image (defined in url) size (achieved by gm size call)=",value);
        if (value) console.log("ratios=",value.width / value.height,value.height / value.width);
        if (!value) {
          console.log('failed to get dimensions - exiting.');
          return res.end('failed to get dimensions.');
        }
        if (value && value.width / value.height < 1.8 && value.height / value.width < 1.8)
                cmd = "crop";
        else
                cmd = "fit";
        console.log(`new cmd=${cmd}`);
        if (cmd === "crop") return gmcrop( req,res,cmd,w,h,src );
        return gmfit( req,res,cmd,w,h,src );
    });
}


//////////////////////////////////////////////// requestHandler function -- param parsing and call image functions

const requestHandler = (req, res) => {
  var parts = req.url.split("?");
  var p = parts[0].split("/");
  var cmd = p[1];  
  var w = parseInt(p[2]); 
  var h = parseInt(p[3]);
  var src = p.slice(4).join("/");
  src = transformsrc(src);
  var contenttype = mime.lookup(src);
  
  var src_no_suffix = src.replace(/\[\d+\]$/,"");
  
  fs.access(src_no_suffix, fs.F_OK, function(err) {
    if (err) {
      console.log(`${new Date().toISOString()} request ${req.url} cmd=${cmd} w=${w} h=${h} src=${src} contenttype=${contenttype} SOURCE FILE NOT FOUND`);
      //console.error(err);
      res.statusCode=404;
      res.end();
      return;
    }
  
    console.log(`${new Date().toISOString()} request ${req.url} cmd=${cmd} w=${w} h=${h} src=${src} contenttype=${contenttype}`);
  
    res.writeHead(200, {'Content-Type': contenttype});
  
    var f = undefined;
    if (cmd === "fit")  f=gmfit;
    if (cmd === "crop") f=gmcrop;
    if (cmd === "croputl") f=gmcroputl;
  
    if (f) return f( req,res,cmd,w,h,src );
    res.end('Hello!');
  } ); //fs.access
}

////////////////////////////////////////////// http server
const server = http.createServer(requestHandler)


server.listen(port, iface, (err) => {
  if (err) return console.log('something bad happened', err)
  console.log(`resizer server is listening on http://${iface}:${port}/ serving dir ${filedir}`)
})
