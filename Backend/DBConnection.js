/*What is the purpose of DBConnections.js?:
This js file contains the lines of code that allows us to connect to our local MySQL database
This js file does NOT recive HTTP requests and does NOT start a server
This js file communicates to the Node.js server  and allows us run SQL quries and store the result in the database per sql processing. 
For code opimitzation, all of the js files that work in the backend and communciate between the database and the frontend via a Node.js server, we'll have them reference here


If we were to implement the lines of code below to each js file (line by line), it would cause the temrinal to spout the samething again and again as we run them together thanks to a dependency concurtentlly
*/
//import the modules/dependcies from the npm/package.json file that work with sql

const mysql = require('mysql');  //  Imports the mysql module, which allows Node.js to interact with mySQL databases.
//the lines below connect to the local databse server via the dotenv file which is converted to .env
const dotenv = require('dotenv');
dotenv.config(); // read from .env file


// if you use .env to configure
console.log("HOST: " + process.env.HOST);
console.log("DB USER: " + process.env.DB_USER);
console.log("PASSWORD: " + process.env.PASSWORD);
console.log("DATABASE: " + process.env.DATABASE);
console.log("DB PORT: " + process.env.DB_PORT);

const connection = mysql.createConnection({
     host: process.env.HOST,
     user: process.env.DB_USER,        
     password: process.env.PASSWORD,
     database: process.env.DATABASE,
     port: process.env.DB_PORT
});

//At this point, we should have successfully connected to the local database server
//the code block below will do an exception handler to verify if we connected to the database
connection.connect((err) => {
     if(err){
        console.log(err.message);
     }
     console.log('db ' + connection.state);    // to see if the DB is connected or not
});

module.exports = connection; //other js files will re-declare connection but were not creating an instance but using the same namining convention 