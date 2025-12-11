//import dependencies and js files:
const connection = require('./DBConnection');
const app = require('./ServerHandling');
const cors = require ('cors'); // Imports the cors module, which enables Cross-Origin Resource Sharing, allowing your server to handle requests from different origins.

function HandlerOne(request, response, next) {
 ClientID = request.body.ClientID; //POST http requests we use .body (Takes the user input from the values of the name attributes, so we grab each name attribute. Naming convention between the name attributes and columns for database are intentional)

 function Unqiue(){ //before goint to HandlerTwo to insert the new ClientID in the database, we need to verify that its unique by scaning it (running a query to the table) to see if the value exsists or not.

    const Query = "SELECT ClientID FROM client WHERE ClientID = ?"; //as stated by the variable, this is the qeuery we run to see if the ClientID already exsists or not in the database

    connection.query(Query, [ClientID], (error, result) => {

        if(error){ //if the attempt to scan straight up did not work, we will return an error
            return next(error);
        }

        else if(result.length > 0){ //remember, if we run the qeury and does return something, that something will always be 1, which proves that the ClientID already exsists in the database, so run the method again
            ClientID = "ID" + Math.random().toString(16).slice(2);
            Unqiue();
        }

        else{ //if the query doesnt return anything, this means the clientID doesnt exsist in the database and thus it is unique, so we can safely call the other method to insert our other methods. 
            request.body.ClientID = ClientID; //verify that the user inputted ClientID is good before we move to the next method
            next();
        }
    });

 }

 Unqiue(); //calls the method 


}


function HandlerTwo(request, response){
    const{FirstName, LastName, Primary_Address, Phone_Number, Email, CreditCardNumber, CreditCardCode, ClientID} = request.body; //POST http requests we use .body (Takes the user input from the values of the name attributes, so we grab each name attribute. Naming convention between the name attributes and columns for database are intentional)
    const QueryVariable = 'INSERT INTO client (FirstName, LastName, Primary_Address, Phone_Number, Email, CreditCardNumber, CreditCardCode, ClientID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'; //the query we want to run
    //below is the exception handler in order for the data that is grabbed from the html table to be populated in the users table 
    connection.query(QueryVariable, [FirstName, LastName, Primary_Address, Phone_Number, Email, CreditCardNumber, CreditCardCode, ClientID], (error, result) => { //us executing/running the query, we want it to return a value of <=0 because this means the ClientID doesnt exsist in the database verifying that it is unqiue and can be added for the user.
        if(error){
            console.log(error); //console.log is the message that will appear on the console (terminal)
            response.status(500).send("Unable to populate table client"); //response.status is the message that will appear on the .html page
        }
        else{
            console.log("Data successfully populated in table client, sign in!");
            //response.send("Data successfully populated in table users");
            response.json({ //Once were successful in getting the client registered, we need to send the user their ClientID AND redirect them. But in order to do both (preferred, we send the dets in the form of a json to the frontend as some js code cant be writen here in the backend)
                message: "Your ClientID is: " + ClientID,
                redirect: "/ClientSignIn.html"
            })
        }
    });
}

//the use of app.post below is to register a new client, grabs the data that was sent into the localhost url endpoint from the corresponding html file and upload it to the Client table via local mySQL database server
//again, for the client registration. 
//how does the html file and the js file connect? The url endpoint for the same method of the http request. For ex: POST and insert
app.post('/insert', HandlerOne, HandlerTwo);


app.listen(5050, 
    () => {
        console.log("I am listening on the fixed port 5050.")  //starts up the server, all other js files will use this single server
    }
);

module.exports = app; //sends the app.post to the proper route