/*
All js files will work in the backend. They're meant to communicate between the frontend and the database. This communication is mainly possible by this js file. 
We should only have one object of express app (so should only declare an instance of express once!). These lines of code ultimately help us set up the server 
by setting up express, but not start the server itself. In short, it makes to where http methods or request can be MADE. The server is what makes the local hoast for these url endpoints to exsist 
*/
const express = require('express'); // Imports the express module, which is a web application framework for Node.js which provides functionality to do the following: It simplifies routing and handling HTTP (a set of rules we follow when trasnfering info on the internet or bteween our computer and a server) REQUESTS like POST, GET, etc.
const Clocation = require('path');
//set up HTTP request for sever:
const app = express(); //app is an instance of the framework express. app will allows us to execute the provided funcalities from express to do the above stated routes. This is the single instance we have created!
//creates or uploads new data by grabbing data from html doc where user input is stored to database-> app.post() -> POST REQUEST ()
//read or retrieve only NON-SENSITIVE data from database -> app.get() -> GET REQUEST
//update exsisting data in the database -> app.put() -> PUT REQUEST
//delete data in the database -> app.delete() -> DELETE REQUEST
//The value of the method attribute within the form element fo your html document needs to match the rspective http method/request: ex html -> method=POST, js -> app.post();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(Clocation.join(__dirname,"../Frontend"))); //because project folder is not in the same location as XAMPP installation (My local machine needed this alt)

module.exports = app; //when other js files reference to this, we'll redeclare app but no in the sense as an object for express but so that we can continue to use aspp.httpmethod
