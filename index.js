// environment variables
require('dotenv').config();

// npm packages
const express = require('express');
const app = express();
const http = require('http').createServer(app)
const socketIo = require('socket.io')(http);
const bodyparser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 3000;

const passport=require("passport");
const Strategy=require("passport-twitter").Strategy;
const session=require("express-session");

// config
const dbConnection = require('./config/database-connection.config');

// routes
const appRoutes= require('./routes/app.routes');
const { request } = require('express');

// app.use('/images', express.static('./callback'));

app.use(bodyparser.urlencoded({extended : true}))
app.use(bodyparser.json());

passport.use(new Strategy({
    consumerKey:process.env.twitter_consumer_key,
    consumerSecret:process.env.twitter_sceret_key,
    callbackURL:"http://localhost:3000/app/twitter/return"
},function(token,tokenSceret,profile,callback){
    callback(null,profile);
}));

passport.serializeUser(function(user,callback){
    callback(null,user);
});

passport.deserializeUser(function(obj,callback){
    callback(null,obj);
});
app.use(session({secret:'whatever',resave:true,saveUninitialized:true}));
app.use(passport.initialize());
app.use(passport.session());

app.use(async function (req, res, next) {
    appRoutes(app,passport);
    next();
});

app.use(cors());

http.listen(port,
    async ()=>{
        //await dbConnection.db(); 
        console.log("Server is up and listening on port : "+port);
    }
)