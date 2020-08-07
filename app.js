require("dotenv").config();
var https = require("https");
const { ExpressPeerServer } = require("peer");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
let fs = require("fs");
let io = require("./io");

var indexRouter = require("./routes/index");

var app = express();

// pem
const key = fs.readFileSync("./cert/key.pem"); //private key
const cert = fs.readFileSync("./cert/certificate.pem"); // certificate

const credentials = {
  key,
  cert,
};

/**
 * Create HTTP server.
 */
var server = https.createServer(credentials, app);
io.attach(server);
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/peerjs", peerServer);
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).send("Resourse not found!");
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = { app, server, io };
