var express = require("express");
var app = express();

var MongoClient = require("mongodb").MongoClient;
var url =
  "mongodb+srv://vsm-superadmin:vsm123@vsm-6jj8t.mongodb.net/development?authSource=admin&replicaSet=vsm-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true";

let dbCollection;
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("development");
  dbCollection = dbo.collection("chatTest");
});
const loadChat = async name => {
  var query = { name };
  let result = await dbCollection.find(query).toArray();
  return result;
};
const writeMsgtoDB = msgObj => {
  dbCollection.insert(msgObj);
};

const http = require("http").Server(app);
const io = require("socket.io")(http);

var bodyParser = require("body-parser");

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 5000;
var router = express.Router();

app.get("/", function(req, res) {
  res.render("index.ejs");
});

router.get("/messages", async function(req, res) {
  const chat = await loadChat("Abhishek");
  return res.json(chat);
});

router.post("/postMessage", function(req, res) {
  writeMsgtoDB(req.body);
  res.json(req.body);
});
app.use("/api", router);

io.sockets.on("connection", function(socket) {
  socket.on("username", async function(username) {
    socket.username = username;
    io.emit("is_online", "🔵 <i>" + socket.username + " join the chat..</i>");
    const chat = await loadChat(socket.username);
    chat.map(({message})=>{
      io.emit("add_message_to_ui", "<i>" + socket.username + "\t" + message + "</i>");
    })
  });
  socket.on("chat_message", async function(msg) {
    io.emit("add_message_to_ui", "<i>" + socket.username + "\t" + msg + "</i>");
    await writeMsgtoDB({ name: socket.username, message: msg });
  });
});

http.listen(port);
console.log("Magic happens on port " + port);
