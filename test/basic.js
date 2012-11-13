var args = require('system').args;
var page = require('webpage').create();

var port = args[1];
var errors = [];
var tests = [
  ['#a', "this text is included"],
  ["#b", "this text overwrote what was just there."]
];

phantom.onError = function(msg, trace) {
    errors.push('PHANTOM ERROR: ' + msg);
};

page.onConsoleMessage = function (msg) {
    console.log('BROWSER CONSOLE: ' + msg);
};

function checkContent(selector, expected) {
    var a = page.evaluate(function(selector) {
      return document.querySelector(selector).textContent;
    }, selector);
    if (a != expected) {
      errors.push(selector + ': "' + a + "\" is not \"" + expected + '"');
    }
}

page.open('http://localhost:' + port + '/', function (status) {
    if (status === "success") {
      console.log("testing " + port + "...");
    } else {
      console.error("Open problem; bailing\n");
      phantom.exit(2);
    }

    var i = 0;
    while (i < tests.length) {
      checkContent(tests[i][0], tests[i][1]);
      i++;
    }
  
    if (errors.length > 0) {
      console.error(errors.join("\n"));
      page.render("error.png");
      phantom.exit(1);
    } else {
      phantom.exit(0);
    }
});