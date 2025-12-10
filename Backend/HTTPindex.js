
//import the modules/dependcies from the npm/package.json file

const express = require('express') // Imports the express module, which is a web application framework for Node.js which provides functionality to do the following: It simplifies routing and handling HTTP (a set of rules we follow when trasnfering info on the internet or bteween our computer and a server) REQUESTS like POST, GET, etc.

const mysql = require('mysql')  //  Imports the mysql module, which allows Node.js to interact with mySQL databases.

const cors = require ('cors') // Imports the cors module, which enables Cross-Origin Resource Sharing, allowing your server to handle requests from different origins.
//the three lines above will import the corresponding package/modules from the package.json file.

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

//-----

//the following methods are methods used to interact with the database (server-side logic)

const app = express(); //app is an instance of the framework express. app will allows us to execute the provided funcalities from express to do the above stated routes
//creates or uploads new data by grabbing data from html doc where user input is stored to database-> app.post() -> POST REQUEST ()
//read or retrieve only NON-SENSITIVE data from database -> app.get() -> GET REQUEST
//update exsisting data in the database -> app.put() -> PUT REQUEST
//delete data in the database -> app.delete() -> DELETE REQUEST
//The value of the method attribute within the form element fo your html document needs to match the rspective http method/request: ex html -> method=POST, js -> app.post();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

const Clocation = require('path');
app.use(express.static(Clocation.join(__dirname,"../Frontend"))); //because project folder is not in the same location as XAMPP installation (My local machine needed this alt)


//the use of app.post below is to register a new client, grab data that was sent into the localhost url endpoint and upload it to the Client table via local mySQL database server
//again, for the client registration 
app.post('/insert', (request, response) => { //we use question marks as pevention of SQL injection attacks for encryption
    const{FirstName, LastName, Primary_Address, Phone_Number, Email, CreditCardNumber, CreditCardCode} = request.body; //POST http requests we use .body
    const QueryVariable = 'INSERT INTO client (FirstName, LastName, Primary_Address, Phone_Number, Email, CreditCardNumber, CreditCardCode) VALUES (?, ?, ?, ?, ?, ?, ?)';
    //below is the exception handler in order for the data that is grabbed from the html table to be populated in the users table 
    connection.query(QueryVariable, [FirstName, LastName, Primary_Address, Phone_Number, Email, CreditCardNumber, CreditCardCode], (error, result) => {
        if(error){
            console.log(error); //console.log is the message that will appear on the console (terminal)
            response.status(500).send("Unable to populate table users"); //response.status is the message that will appear on the .html page
        }
        else{
            console.log("Data successfully populated in table users, sign in!");
            //response.send("Data successfully populated in table users");
             response.redirect(`/SignIn.html`); //redirect users to sign in portal on registration
        }
    });
});



app.listen(5050, 
    () => {
        console.log("I am listening on the fixed port 5050.")
    }
);