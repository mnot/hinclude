var args = require('system').args;
var webpage = require('webpage');



function runTests(page_loc, tests) {
  var port = args[1];
  var errors = [];
  var page = webpage.create();

  function checkContent(selector, expected) {
      var a = page.evaluate(function(selector) {
        return document.querySelector(selector).textContent;
      }, selector);
      if (a != expected) {
        errors.push(selector + ': "' + a + "\" is not \"" + expected + '"');
      }
  }

  phantom.onError = function(msg, trace) {
      errors.push('PHANTOM ERROR: ' + msg);
  };

  page.onConsoleMessage = function (msg) {
      console.log('BROWSER CONSOLE: ' + msg);
  };

  page.open('http://localhost:' + port + '/' + page_loc, function (status) {
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
 
}

exports.runTests = runTests;