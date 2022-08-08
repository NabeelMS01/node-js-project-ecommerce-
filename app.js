 const createError = require("http-errors");
 const express = require("express");
 const path = require("path");
 const cookieParser = require("cookie-parser");
 const logger = require("morgan");
 const db = require("./config/connection");
 const session = require("express-session");
 const flash = require("connect-flash");
//  const fileUpload = require('express-fileUpload')
 const multer = require("multer");
require("dotenv").config()

// connect mongodb
db.connect((err) => {
  if (err) {
    console.log("db connection error");
  } else {
    console.log("db connected successfully");
  }
});

 const userRouter = require("./routes/users");
 const adminRouter = require("./routes/admin");

 const app = express();
 const hbs = require("express-handlebars");
const { Db } = require("mongodb");
// view engine setup
app.set("views", path.join(__dirname, "views"));

app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials/",
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({ secret: "key", cookie: { maxAge: 6000000 }, resave: false,saveUninitialized:false }));
app.use(flash());
// app.use(fileUpload())
app.use((req, res, next) => {
  if (!req.user) {
    res.header("cache-control", "private,no-cache,no-store,must revalidate");
    res.header("Express", "-3");
  }
  next();
});


app.use("/", userRouter);
app.use("/admin", adminRouter);


app.get("*",(req,res)=>{
  res.render('user/404',{userUi:true, logedIn: req.session.loggedIn, category: req.session.category,
    cartCount: req.session.cartCount,})
  
  });

app.use(
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")));
// app.use( express.static(path.join(__dirname, '/public/assets/css')))
// app.use( express.static(path.join(__dirname, '/public/assets/js')))
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
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

module.exports = app;
