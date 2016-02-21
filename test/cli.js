var readline = require('readline');
var fs = require('fs');

var rl = readline.createInterface({
  input: fs.createReadStream('test/in.txt'),
  output: fs.createWriteStream('test/out.txt', {
    flags: 'r+'
  })
});

rl.on('line', function (line) {
  if (line.match(/foobar/)) {
    rl.write(line.replace(/foo/, 'baz'));
  }
});
