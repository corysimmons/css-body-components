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
      var markupDistDir = path.join(path.dirname(markupSrcPath), markupDist);
      var markupDistPath = path.join(markupDistDir, path.basename(markupSrcPath));

      shell.mkdir('-p', markupDistDir);

      var rl = readline.createInterface({
        input: fs.createReadStream(markupSrcPath),
        output: fs.createWriteStream(markupDistPath, {
          flags: 'r+',
          autoClose: false
        })
      });

      console.log(rl.output);
      console.log('\n\n\n');

      rl.on('line', function (line) {
        if (line.match(/rel="stylesheet"/)) {
          console.log('Line has <link>:', line);

          rl.write(line.replace(/>/, '> <script> </script>'));
        }
      });
    });
  });
});
