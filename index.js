var express = require("express");
var app = express();

const http = require("http").Server(app);
const io = require("socket.io")(http);

var bodyParser = require("body-parser");

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;
var router = express.Router();

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
app.get("/", function(req, res) {
  res.render("index.ejs");
});

router.get("/messages", function(req, res) {
  const messages = {
    1: ["Hi whats up", "how are you"],
    2: ["I love you"]
  };
  res.json({ messages });
});

router.post("/postMessage", function(req, res) {
  //   const message =
  //     "I am good. Can you write my notes for Thermodynamics? I got some commitments.";
  //   const body = {
  //     id: 3,
  //     message
  //   };
  res.json(req.body);
});
app.use("/api", router);

io.sockets.on("connection", function(socket) {
  socket.on("username", function(username) {
    socket.username = username;
    io.emit("is_online", "🔵 <i>" + socket.username + " join the chat..</i>");
  });
  socket.on("chat_message", function(msg) {
    console.log("msg we got from request ......", msg);
  });
});

http.listen(port);
console.log("Magic happens on port " + port);
