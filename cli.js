var fs = require('fs-extra');
var path = require('path');
var readline = require('readline');

var meow = require('meow');
var globby = require('globby');
var concat = require('concat');

var cli = meow('Usage: $ css-body-components example.html --markup-dist markup/dist --css-src css/src --css-dist css/dist --max-stylesheets 5\n ');

var markupDist = cli.flags.markupDist || 'markup/dist';
var maxStylesheets = cli.flags.maxStylesheets || 5;
var cssSrc = cli.flags.cssSrc || 'css/src';
var cssDist = cli.flags.cssDist || 'css/dist';

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
              // append script tags (firefix)
              var newLine = line.replace(/(.*)/, '$1<script> </script>');
              // add css dist path
              var distNewLine = newLine.replace(/"(.*?)"/g, function (strMatch) {
                if (strMatch.match(/.css/)) {
                  var str = strMatch.replace(/"/g, '');
                  return '"' + path.join(cssDist, str) + '"';
                } else {
                  return strMatch;
                }
              });
              ws.write(distNewLine + '\n', 'utf8');
            } else if (uniqueLinks.length === maxStylesheets) {
              // placeholder to grep so we can add the fat css after everything
              // todo: DRY out when i'm not tired
              // append script tags (firefix)
              var newLine = line.replace(/(.*)/, '$1<script> </script>');
              // add css dist path
              var distNewLine = newLine.replace(/"(.*?)"/g, function (strMatch) {
                if (strMatch.match(/.css/)) {
                  var str = strMatch.replace(/"/g, '');
                  return '"' + path.join(cssDist, str) + '"';
                } else {
                  return strMatch;
                }
              });
              ws.write(distNewLine + '133713371337\n', 'utf8');
            }
          }
        } else {
          ws.write(line + '\n', 'utf8');
        }
      });

      // add fat final stylesheet
      rl.on('close', function () {
        // copy over winner links from src to dist
        var winnerLinks = uniqueLinks.slice(0, maxStylesheets);
        winnerLinks.forEach(function (winnerLink) {
          var winnerLinkPath = winnerLink.replace(/.*href="(.*)".*/, '$1');
          var winnerLinkBasename = path.basename(winnerLinkPath);
          var winnerLinkFilePath = path.join(cssSrc, winnerLinkBasename);
          try {
            fs.copySync(winnerLinkFilePath, path.join(cssDist, winnerLinkBasename));
          } catch (err) {
            console.error(err);
          }
        });

        var loserLinks = uniqueLinks.slice(maxStylesheets - 1);

        // no need to proceed if no loser links
        if (loserLinks.length > 0) {
          var loserLinkPaths = [];
          var loserLinkBasenames = [];

          loserLinks.forEach(function (loserLink) {
            var loserLinkPath = loserLink.replace(/.*href="(.*)".*/, '$1');
            var loserLinkBasename = path.basename(loserLinkPath);
            var loserLinkCleanBasename = path.basename(loserLinkPath, '.css');

            loserLinkPaths.push(path.join(cssSrc, loserLinkBasename));
            loserLinkBasenames.push(loserLinkCleanBasename);
          });

          var sortedLoserLinkBasenames = loserLinkBasenames.sort();
          var fatCssFileName = sortedLoserLinkBasenames.join('___') + '.css';
          var fatCssFilePath = path.join(cssDist, 'fat', fatCssFileName);

          fs.removeSync(fatCssFilePath);
          fs.ensureFileSync(fatCssFilePath);

          // concat all loser links to one fat file
          concat(loserLinkPaths, fatCssFilePath, function (err) {
            if (err) throw err;
          });

          // replace entire page contents with entire page contents + fat link
          fs.readFile(markupDistPath, 'utf8', function (err, data) {

            var cleanFatLink = data.replace(/([^\s].*133713371337)/, function (dirtyLink) {
              // <link rel="stylesheet" href="example/css/dist/button-5.css"><script> </script>133713371337
              var sansLeet = dirtyLink.replace(/133713371337/, '');

              // todo: DRY
              var cleanLink = sansLeet.replace(/"(.*?)"/g, function (strMatch) {
                if (strMatch.match(/.css/)) {
                  var str = strMatch.replace(/"/g, '');
                  return '"' + fatCssFilePath + '"';
                } else {
                  return strMatch;
                }
              });

              return cleanLink;
            });

            // Write the clean fat link
            fs.writeFileSync(markupDistPath, cleanFatLink);
          });
        }
      });
    });
  });
});
