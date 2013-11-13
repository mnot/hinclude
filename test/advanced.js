var runTests = require('./framework.js').runTests;

var tests = [
  ['#onload', "this onload is executed"],
  ['#library', "this library is visible"],
  ['#child', "child included"]
];

runTests("advanced.html", tests);