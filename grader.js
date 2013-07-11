#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URLLINK_DEFAULT = "http://fierce-reaches-1070.herokuapp.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertLinkExists = function(link){
   if(link === undefined){
       console.log("%s not provided.", link);
       process.exit(1);
   }
   return link;
}

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    return checkHtmlContent($, checksfile);
};

var checkHtmlContent = function($, checksfile){

    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
}

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var fileOrUrl = function(fileVal, urlVal){
    console.log("File or url");
    console.log(fileVal);
    console.log(urlVal);
    if(fileVal){
        return fileVal;
    }else if(urlVal){
        return urlVal;
    }else{
        console.log("Neither file nor Url parameter selected");
        return false;
    }
    return false;
};

var checkUrlFile = function(urllink, checksfile){
    rest.get(urllink).on('success', function(result) { 
        fs.writeFile("MyFile", result
        , function(err){
            if(err) throw err;
            console.log("No error");
            $ = cheerioHtmlFile("MyFile");
        var temp = checkHtmlContent($, checksfile);
        var outJson = JSON.stringify(temp, null, 4);
        console.log(outJson);
     //  console.log(temp);
 //   return temp; //checkHtmlContent($, checksfile);
        });
   
    //   console.log("Writing file ...."); 
    });
}

if(require.main == module) {
    program
        .option('-f, --file <html_file>', 'Path to index.html') //, clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-u, --url <url_link>', 'Path to url_link') //, clone(assertLinkExists), URLLINK_DEFAULT)
        .parse(process.argv);
    var checkFileUrl = fileOrUrl(program.file, program.url);
    if(!checkFileUrl){
        program.file = HTMLFILE_DEFAULT;
    }  
        
    if(program.file){
        var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
    } else if(program.url){
        console.log("processing for URL");
    //    var checkJson =  
            checkUrlFile(program.url, program.checks);
    } else {
        console.log("Uncaught condition");
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
