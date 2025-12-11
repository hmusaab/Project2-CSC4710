//import dependencies and js files:
const connection = require('./DBConnection');
const app = require('./ServerHandling');
const cors = require ('cors'); // Imports the cors module, which enables Cross-Origin Resource Sharing, allowing your server to handle requests from different origins.


app.post('/plugin', (request, response) => {
    const{RequestID, Service_Address, Cleaning_Type, Rooms, Pref_Date, Pref_Time, Pref_Budget, Optional_Note} = request.body;
    const QueryVariable = 'INSERT INTO servicerequest (RequestID, Service_Address, Cleaning_Type, Rooms, Pref_Date, Pref_Time, Pref_Budget, Optional_Note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(QueryVariable, [RequestID, Service_Address, Cleaning_Type, Rooms, Pref_Date, Pref_Time, Pref_Budget, Optional_Note], (error, result) => {
        if(error){
            console.log(error); //console.log is the message that will appear on the console (terminal)
            response.status(500).send("Unable to populate table servicerequest"); //response.status is the message that will appear on the .html page
        }
        else{
            console.log("Data successfully populated in table servicerequest!");
            //response.send("Data successfully populated in table users");
             response.redirect(`/ClientSignIn.html`); //redirect users to sign in portal on registration
        }
    });
});


module.exports = app; //sends the app.post to the route 