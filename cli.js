var fs = require('fs-extra');
var path = require('path');
var readline = require('readline');

var meow = require('meow');
var globby = require('globby');
var concat = require('concat');

var cli = meow('Usage: $ css-body-components example.html --markup-dist markup/dist --css-src css/src --css-dist css/dist --max-stylesheets 5\n ');

var markupDist = markupDist || 'markup/dist';
var maxStylesheets = maxStylesheets || 5;

cli.input.forEach(function (globPattern) {
  globby([globPattern, '!node_modules/**']).then(function (paths) {
    paths.forEach(function (markupSrcPath) {
      // set paths
      var markupDistDir = path.join(path.dirname(markupSrcPath), markupDist);
      var markupDistPath = path.join(markupDistDir, path.basename(markupSrcPath));

      // clean/prep files/dirs
      fs.removeSync(markupDistPath);
      fs.mkdirsSync(markupDistDir);

      // prep read/write streams
      var rl = readline.createInterface({
        input: fs.createReadStream(markupSrcPath)
      });
      var ws = fs.createWriteStream(markupDistPath, {
        flags: 'w'
      });

      // read each line and test/replace <link> with appropriate stuff
      var uniqueLinks = [];

      rl.on('line', function (line) {
        if (line.match(/rel="stylesheet"/)) {
          if (uniqueLinks.indexOf(line.trim()) === -1) {
            // put fresh links in uniqueLinks arr
            uniqueLinks.push(line.trim());

            // adhere to max stylesheets
            if (uniqueLinks.length < maxStylesheets) {
              // clean up fresh links
              var newLine = line.replace(/(.*)/, '$1<script> </script>');
              ws.write(newLine + '\n', 'utf8');
            }
          }
        } else {
          ws.write(line + '\n', 'utf8');
        }
      });

      // add fat final stylesheet
      rl.on('close', function () {
        var loserLinks = uniqueLinks.slice(maxStylesheets - 1);
        var loserLinkPaths = [];
        var loserLinkBasenames = [];

        loserLinks.forEach(function (loserLink) {
          var loserLinkPath = loserLink.replace(/.*href="(.*)".*/, '$1');
          loserLinkPaths.push(loserLinkPath);

          var loserLinkBasename = path.basename(loserLinkPath, '.css');
          loserLinkBasenames.push(loserLinkBasename);
        });

        var sortedLoserLinkBasenames = loserLinkBasenames.sort();
        var fatCssFileName = sortedLoserLinkBasenames.join('-') + '.css';

        concat(loserLinkPaths, fatCssFileName, function (err) {
          if (err) throw err;
        });
      });
    });
  });
});
