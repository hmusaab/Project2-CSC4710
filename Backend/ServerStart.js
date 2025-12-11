const app = require('./ServerHandling');

// load route files so they attach to app
require('./HTTPindex');
require('./HTTPClientSignIn');
require('./HTTPSRS');

app.listen(5050, () => {
    console.log("Server listening on port 5050");
});


/*
This js file starts the actual single server!

*/