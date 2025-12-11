//import dependencies and js files:
const connection = require('./DBConnection');
const app = require('./ServerHandling');
const cors = require ('cors'); // Imports the cors module, which enables Cross-Origin Resource Sharing, allowing your server to handle requests from different origins.



//We WOULD use app.get() but because this deals with sensitive info, we will use POST per ClientID as sensitive info
//remeber the URL endpoint and the HTTP method is what allows the respective js file and html to communicate by being the same.
app.post("/verify", (request, response) => {
    const{ClientID} = request.body; 
    const Variable = ClientID;
    const QueryVariable = 'SELECT ClientID FROM client WHERE ClientID = ?';
    connection.query(QueryVariable, [ClientID], (error, result) => {
        if(result.length > 0){
            console.log(`Success! Welcome back ${Variable}`); //DONT use qoutes for js vairables, use backsticks
            response.redirect(`/ServiceRequestSub.html?User=${Variable}`); //Since you're utlizing express via app, use the express built in redirect tool, more appropriate. 
        }
        else if(error){
            console.log(error);
            response.status(500).send("There was an error in attempting to match, try again.");
        }
        else{
            console.log("Wrong credintals or account DNE, try again if latter");
            response.status(401).send("Wrong credintals or account DNE, try again if latter");
        }
    });
});

module.exports = app; //sends the app.post to the route 