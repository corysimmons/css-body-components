var fs = require('fs');
var path = require('path');
var readline = require('readline');

var meow = require('meow');
var globby = require('globby');
var shell = require('shelljs');

var cli = meow('Usage: $ css-body-components example.html --markup-dist markup/dist --css-src css/src --css-dist css/dist\n ');

var markupDist = markupDist || 'markup/dist';

cli.input.forEach(function (globPattern) {
  globby([globPattern, '!node_modules/**']).then(function (paths) {
    paths.forEach(function (markupSrcPath) {
      var markupDistDir = path.join(markupDist, path.dirname(markupSrcPath));

      shell.mkdir('-p', markupDistDir);

      var rl = readline.createInterface({
        input: fs.createReadStream(markupSrcPath),
        output: fs.createWriteStream(path.join(markupDistDir, path.basename(markupSrcPath)))
      });

      rl.on('line', function (line) {
        if (line.match(/rel="stylesheet"/)) {
          console.log('Line has <link>:', line);
        }
      });

      rl.close();
    });
  });
});
