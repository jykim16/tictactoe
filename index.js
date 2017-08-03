const express = require('express');
let app = express();
let path = require('path')

app.use(express.static(path.join(__dirname )));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'))
});
console.log('dirname',__dirname)
let port = process.env.PORT || 8080
app.listen(port, function(err) {
  if(err) console.log(err);
  console.log('listening from port ', port)
});
