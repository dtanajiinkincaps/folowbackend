// environment variables
require('dotenv').config();

// npm packages
const express = require('express');
const app = express();
const http = require('http').createServer(app)
const socketIo = require('socket.io')(http);
const bodyparser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 4000;
// config
const dbConnection = require('./config/database-connection.config');

// routes
const appRoutes= require('./routes/app.routes');

// app.use('/images', express.static('./callback'));

app.use(bodyparser.urlencoded({extended : true}))
app.use(bodyparser.json());

app.use(async function (req, res, next) {
    appRoutes(app);
    next();
});

app.use(cors());


http.listen(port,
    async ()=>{
        //await dbConnection.db(); 
        console.log("Server is up and listening on port : "+port);
    }
)