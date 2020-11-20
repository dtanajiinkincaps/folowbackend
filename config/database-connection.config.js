//NPM Packages
const mongoose = require('mongoose');


var db;

const databaseOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    keepAlive: true,
    poolSize: 10,
    useUnifiedTopology: true,
    useFindAndModify:false
}

mongoose.Promise = global.Promise;


function connect() {
    return new Promise(function (resolve, reject) {
        mongoose.connect(process.env.databaseUrl, databaseOptions,
            function (err, database) {
                if (err) {
                    console.log("Mongoose Connect Fail Error : ", err);
                    reject(err);
                    process.exit();
                }
                else {
                    db = database;
                }
            }).then(async () => {

                console.log("Database successfully connnected");
                resolve(db)
            }).
            catch(err => {
                console.log("Could not connect to database\nProcess Exit\nError", err);
                reject(err);
                process.exit();
            });
    });
}

module.exports.db = () => {
    return new Promise(async function (resolve, reject) {
        if (mongoose.connection.readyState == 0) {
            let db = await connect();
            resolve(db)
        }
        else {
            resolve(mongoose.connection.db)
        }
    })
}