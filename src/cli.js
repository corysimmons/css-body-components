var fs = require('fs-extra');
var path = require('path');
var readline = require('readline');

var meow = require('meow');
var globby = require('globby');

var cli = meow('Usage: $ css-body-components example.html --markup-dist markup/dist --css-src css/src --css-dist css/dist\n ');

var markupDist = markupDist || 'markup/dist';

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
      rl.on('line', function (line) {
        if (line.match(/rel="stylesheet"/)) {
          var newLine = line.replace(/(.*)/, '$1<script> </script>');
          ws.write(newLine + '\n', 'utf8');
        } else {
          ws.write(line + '\n', 'utf8');
        }
      });
    });
  });
});
