var vows = require('vows');
var path = require('path');
var fs = require('fs');
var assert = require('assert');
var CleanCSS = require('../index');

var lineBreak = require('os').EOL;

if (process.platform == 'win32')
  return;

var batchContexts = function () {
  var context = {};
  var dir = path.join(__dirname, 'fixtures');
  fs.readdirSync(dir).forEach(function (filename) {
    if (filename.indexOf('.css') == -1 || /min.css$/.exec(filename) || !fs.statSync(path.join(dir, filename)).isFile())
      return;
    var testName = filename.split('.')[0];

    context[testName] = {
      topic: function () {
        var plainPath = path.join('test', 'fixtures', testName + '.css');
        var minPath = path.join(__dirname, 'fixtures', testName + '-min.css');

        return {
          plain: '@import "' + plainPath + '";',
          preminified: fs.readFileSync(minPath, 'utf8')
        };
      },
      'minifying': {
        topic: function (data) {
          var self = this;

          new CleanCSS({
            keepBreaks: true
          }).minify(data.plain, function (errors, minified) {
            self.callback(errors, minified.styles, data);
          });
        },
        'should output right content': function (errors, minified, data) {
          var minifiedRules = minified.split(lineBreak);
          var preminifiedRules = data.preminified.split(lineBreak);

          minifiedRules.forEach(function (line, i) {
            assert.equal(line, preminifiedRules[i]);
          });
        }
      },
      'minifying with source maps': {
        topic: function (data) {
          var self = this;

          new CleanCSS({
            keepBreaks: true,
            sourceMap: true
          }).minify(data.plain, function (errors, minified) {
            self.callback(errors, minified.styles, data);
          });
        },
        'should output right content': function (errors, minified, data) {
          var minifiedTokens = minified.split(lineBreak);
          var preminifiedTokens = data.preminified.split(lineBreak);

          minifiedTokens.forEach(function (line, i) {
            assert.equal(line, preminifiedTokens[i]);
          });
        }
      }
    };
  });

  return context;
};

vows.describe('clean-batch')
  .addBatch(batchContexts())
  .export(module);
