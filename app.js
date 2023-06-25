let https = require("https");
let fs = require("fs");
let path = require("path");
let express = require("express");
let socketService = require("./service/socketService");
let app = express();
let options = {
    key  : fs.readFileSync('./cert/1.key'),
    cert : fs.readFileSync('./cert/1.pem')
};
app.use(express.static(path.join(__dirname, "/")));
let server = https.createServer(options,app);
server.listen(443);
socketService(server);