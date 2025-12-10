const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DB_USER,        
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if(err){
       console.log(err.message);
    }
    console.log('Service Request DB connection: ' + connection.state);
});

// ============ SERVICE REQUEST SUBMISSION ============
app.post('/submit-service-request', (request, response) => {
    const {ClientID, Service_Address, Cleaning_Type, Rooms, Pref_Date, Pref_Time, Pref_Budget, Optional_Note} = request.body;
    
    const query = `INSERT INTO ServiceRequest (ClientID, Service_Address, Cleaning_Type, Rooms, Pref_Date, Pref_Time, Pref_Budget, Optional_Note, Request_Status) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`;
    
    connection.query(query, [ClientID, Service_Address, Cleaning_Type, Rooms, Pref_Date, Pref_Time, Pref_Budget, Optional_Note], (error, result) => {
        if(error){
            console.log(error);
            response.status(500).send("Unable to submit service request");
        } else {
            console.log("Service request submitted successfully");
            response.status(200).json({message: "Service request submitted", requestId: result.insertId});
        }
    });
});

// ============ GET REQUESTS FOR ANNA (by status) ============
app.get('/requests', (request, response) => {
    const status = request.query.status;
    
    let query = 'SELECT * FROM ServiceRequest';
    let params = [];
    
    if (status && status !== 'all') {
        query += ' WHERE Request_Status = ?';
        params.push(status);
    }
    
    query += ' ORDER BY Created_At DESC';
    
    connection.query(query, params, (error, results) => {
        if(error){
            console.log(error);
            response.status(500).send("Unable to fetch requests");
        } else {
            response.status(200).json(results);
        }
    });
});

// ============ GET CLIENT'S REQUESTS ============
app.get('/client-requests/:clientId', (request, response) => {
    const clientId = request.params.clientId;
    
    const query = `SELECT sr.*, 
                   (SELECT Quote_Note FROM Quote WHERE RequestID = sr.RequestID AND Quote_Status = 'rejected' LIMIT 1) as rejection_note
                   FROM ServiceRequest sr 
                   WHERE ClientID = ? 
                   ORDER BY Created_At DESC`;
    
    connection.query(query, [clientId], (error, results) => {
        if(error){
            console.log(error);
            response.status(500).send("Unable to fetch client requests");
        } else {
            response.status(200).json(results);
        }
    });
});

// ============ REJECT REQUEST ============
app.post('/reject-request', (request, response) => {
    const {requestId, note} = request.body;
    
    // Update request status
    const updateQuery = 'UPDATE ServiceRequest SET Request_Status = "rejected" WHERE RequestID = ?';
    
    connection.query(updateQuery, [requestId], (error, result) => {
        if(error){
            console.log(error);
            response.status(500).send("Unable to reject request");
        } else {
            // Insert rejection note as a quote record
            const quoteQuery = 'INSERT INTO Quote (RequestID, Quote_Note, Quote_Status) VALUES (?, ?, "rejected")';
            connection.query(quoteQuery, [requestId, note], (err, res) => {
                if(err){
                    console.log(err);
                }
                response.status(200).json({message: "Request rejected"});
            });
        }
    });
});

// ============ SUBMIT QUOTE ============
app.post('/submit-quote', (request, response) => {
    const {requestId, quotedPrice, scheduledDate, scheduledTime, note} = request.body;
    
    // Insert quote
    const quoteQuery = `INSERT INTO Quote (RequestID, Quoted_Price, Scheduled_Date, Scheduled_Time, Quote_Note, Quote_Status) 
                        VALUES (?, ?, ?, ?, ?, 'pending')`;
    
    connection.query(quoteQuery, [requestId, quotedPrice, scheduledDate, scheduledTime, note], (error, result) => {
        if(error){
            console.log(error);
            response.status(500).send("Unable to submit quote");
        } else {
            // Update request status to 'quoted'
            const updateQuery = 'UPDATE ServiceRequest SET Request_Status = "quoted" WHERE RequestID = ?';
            connection.query(updateQuery, [requestId], (err, res) => {
                if(err){
                    console.log(err);
                }
                
                // Add to negotiation history
                const negQuery = `INSERT INTO Negotiation (QuoteID, RequestID, Sender_Type, Message, Counter_Price, Counter_Date, Counter_Time)
                                  VALUES (?, ?, 'anna', ?, ?, ?, ?)`;
                const message = note || 'Initial quote provided';
                connection.query(negQuery, [result.insertId, requestId, message, quotedPrice, scheduledDate, scheduledTime], (e, r) => {
                    response.status(200).json({message: "Quote submitted", quoteId: result.insertId});
                });
            });
        }
    });
});

// ============ GET QUOTE FOR REQUEST ============
app.get('/quote/:requestId', (request, response) => {
    const requestId = request.params.requestId;
    
    const query = 'SELECT * FROM Quote WHERE RequestID = ? AND Quote_Status != "rejected" ORDER BY Created_At DESC LIMIT 1';
    
    connection.query(query, [requestId], (error, results) => {
        if(error){
            console.log(error);
            response.status(500).send("Unable to fetch quote");
        } else {
            response.status(200).json(results[0] || null);
        }
    });
});

// ============ ACCEPT QUOTE (Create Service Order) ============
app.post('/accept-quote', (request, response) => {
    const {requestId, quoteId} = request.body;
    
    // First get quote and request details
    const getDetailsQuery = `SELECT q.*, sr.ClientID 
                            FROM Quote q 
                            JOIN ServiceRequest sr ON q.RequestID = sr.RequestID 
                            WHERE q.QuoteID = ?`;
    
    connection.query(getDetailsQuery, [quoteId], (error, results) => {
        if(error || results.length === 0){
            console.log(error);
            response.status(500).send("Unable to fetch quote details");
            return;
        }
        
        const quote = results[0];
        
        // Create service order
        const orderQuery = `INSERT INTO ServiceOrder (RequestID, QuoteID, ClientID, Final_Price, Scheduled_Date, Scheduled_Time, Order_Status)
                           VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`;
        
        connection.query(orderQuery, [requestId, quoteId, quote.ClientID, quote.Quoted_Price, quote.Scheduled_Date, quote.Scheduled_Time], (err, result) => {
            if(err){
                console.log(err);
                response.status(500).send("Unable to create service order");
            } else {
                // Update quote and request status
                const updateQuoteQuery = 'UPDATE Quote SET Quote_Status = "accepted" WHERE QuoteID = ?';
                const updateRequestQuery = 'UPDATE ServiceRequest SET Request_Status = "accepted" WHERE RequestID = ?';
                
                connection.query(updateQuoteQuery, [quoteId], (e1, r1) => {
                    connection.query(updateRequestQuery, [requestId], (e2, r2) => {
                        response.status(200).json({message: "Quote accepted, service order created", orderId: result.insertId});
                    });
                });
            }
        });
    });
});

// ============ SUBMIT COUNTER OFFER (Client) ============
app.post('/counter-offer', (request, response) => {
    const {requestId, quoteId, message, counterPrice, counterDate, counterTime} = request.body;
    
    // Add negotiation entry
    const negQuery = `INSERT INTO Negotiation (QuoteID, RequestID, Sender_Type, Message, Counter_Price, Counter_Date, Counter_Time)
                      VALUES (?, ?, 'client', ?, ?, ?, ?)`;
    
    connection.query(negQuery, [quoteId, requestId, message, counterPrice, counterDate, counterTime], (error, result) => {
        if(error){
            console.log(error);
            response.status(500).send("Unable to submit counter offer");
        } else {
            // Update statuses
            const updateQuoteQuery = 'UPDATE Quote SET Quote_Status = "countered" WHERE QuoteID = ?';
            const updateRequestQuery = 'UPDATE ServiceRequest SET Request_Status = "negotiating" WHERE RequestID = ?';
            
            connection.query(updateQuoteQuery, [quoteId], (e1, r1) => {
                connection.query(updateRequestQuery, [requestId], (e2, r2) => {
                    response.status(200).json({message: "Counter offer submitted"});
                });
            });
        }
    });
});

// ============ GET NEGOTIATION HISTORY ============
app.get('/negotiations/:requestId', (request, response) => {
    const requestId = request.params.requestId;
    
    const query = 'SELECT * FROM Negotiation WHERE RequestID = ? ORDER BY Created_At ASC';
    
    connection.query(query, [requestId], (error, results) => {
        if(error){
            console.log(error);
            response.status(500).send("Unable to fetch negotiation history");
        } else {
            response.status(200).json(results);
        }
    });
});

// ============ GET ORDERS (by status) ============
// GET endpoint to retrieve service orders filtered by status
// Query parameter: status (scheduled, in_progress, completed, cancelled, or 'all')
app.get('/orders', (request, response) => {
    const status = request.query.status; // Get status filter from query parameter
    
    // Join ServiceOrder with ServiceRequest to get full order details
    let query = `SELECT so.*, sr.Service_Address, sr.Cleaning_Type, sr.Rooms,
                 (SELECT COUNT(*) FROM Bill WHERE OrderID = so.OrderID) as has_bill
                 FROM ServiceOrder so
                 LEFT JOIN ServiceRequest sr ON so.RequestID = sr.RequestID`;
    let params = [];
    
    // Add WHERE clause if status is specified and not 'all'
    if (status && status !== 'all') {
        query += ' WHERE so.Order_Status = ?';
        params.push(status);
    }
    
    query += ' ORDER BY so.Created_At DESC'; // Order by most recent first
    
    // Execute the query
    connection.query(query, params, (error, results) => {
        if(error){
            console.log(error);
            response.status(500).send("Unable to fetch orders");
        } else {
            response.status(200).json(results); // Return array of service orders
        }
    });
});

// ============ START ORDER ============
// POST endpoint for Anna to start a scheduled service order
// Request body: {orderId}
app.post('/start-order', (request, response) => {
    const {orderId} = request.body; // Extract order ID
    
    // Update order status to 'in_progress'
    const updateQuery = 'UPDATE ServiceOrder SET Order_Status = "in_progress" WHERE OrderID = ?';
    
    connection.query(updateQuery, [orderId], (error, result) => {
        if(error){
            console.log(error);
            response.status(500).send("Unable to start order");
        } else {
            console.log(`Order ${orderId} started`);
            response.status(200).json({message: "Order started successfully"});
        }
    });
});

// ============ COMPLETE ORDER ============
// POST endpoint for Anna to mark a service order as completed
// Request body: {orderId}
app.post('/complete-order', (request, response) => {
    const {orderId} = request.body; // Extract order ID
    
    // Update order status to 'completed' and set completion timestamp
    const updateQuery = 'UPDATE ServiceOrder SET Order_Status = "completed", Completion_Date = NOW() WHERE OrderID = ?';
    
    connection.query(updateQuery, [orderId], (error, result) => {
        if(error){
            console.log(error);
            response.status(500).send("Unable to complete order");
        } else {
            console.log(`Order ${orderId} completed`);
            response.status(200).json({message: "Order completed successfully"});
        }
    });
});

// ============ CANCEL ORDER ============
// POST endpoint for Anna to cancel a service order
// Request body: {orderId, reason}
app.post('/cancel-order', (request, response) => {
    const {orderId, reason} = request.body; // Extract order ID and cancellation reason
    
    // Update order status to 'cancelled'
    const updateQuery = 'UPDATE ServiceOrder SET Order_Status = "cancelled" WHERE OrderID = ?';
    
    connection.query(updateQuery, [orderId], (error, result) => {
        if(error){
            console.log(error);
            response.status(500).send("Unable to cancel order");
        } else {
            console.log(`Order ${orderId} cancelled. Reason: ${reason}`);
            response.status(200).json({message: "Order cancelled successfully"});
        }
    });
});

// ============ GENERATE BILL ============
// POST endpoint for Anna to generate a bill after service completion
// Request body: {orderId, clientId, amount, tax, totalAmount, note}
app.post('/generate-bill', (request, response) => {
    const {orderId, clientId, amount, tax, totalAmount, note} = request.body; // Extract bill details
    
    // Check if bill already exists for this order
    const checkQuery = 'SELECT BillID FROM Bill WHERE OrderID = ?';
    
    connection.query(checkQuery, [orderId], (checkError, checkResults) => {
        if(checkError){
            console.log(checkError);
            response.status(500).send("Error checking existing bill");
            return;
        }
        
        if(checkResults.length > 0){
            response.status(400).send("Bill already exists for this order");
            return;
        }
        
        // Insert new bill into Bill table
        const billQuery = `INSERT INTO Bill (OrderID, ClientID, Amount, Tax, Total_Amount, Bill_Note, Bill_Status)
                          VALUES (?, ?, ?, ?, ?, ?, 'pending')`;
        
        connection.query(billQuery, [orderId, clientId, amount, tax, totalAmount, note], (error, result) => {
            if(error){
                console.log(error);
                response.status(500).send("Unable to generate bill");
            } else {
                console.log(`Bill generated for Order ${orderId}. Bill ID: ${result.insertId}`);
                response.status(200).json({message: "Bill generated successfully", billId: result.insertId});
            }
        });
    });
});

// ============ GET BILL FOR ORDER ============
// GET endpoint to retrieve bill information for a specific order
app.get('/bill/:orderId', (request, response) => {
    const orderId = request.params.orderId; // Get order ID from URL parameter
    
    // Select bill for this order
    const query = 'SELECT * FROM Bill WHERE OrderID = ? LIMIT 1';
    
    connection.query(query, [orderId], (error, results) => {
        if(error){
            console.log(error);
            response.status(500).send("Unable to fetch bill");
        } else {
            response.status(200).json(results[0] || null); // Return bill or null if not found
        }
    });
});

// ============ GET CLIENT BILLS ============
// GET endpoint to retrieve all bills for a specific client
app.get('/client-bills/:clientId', (request, response) => {
    const clientId = request.params.clientId; // Get client ID from URL parameter
    
    // Select all bills for this client with order details
    const query = `SELECT b.*, so.OrderID, so.Scheduled_Date, so.Scheduled_Time
                   FROM Bill b
                   JOIN ServiceOrder so ON b.OrderID = so.OrderID
                   WHERE b.ClientID = ?
                   ORDER BY b.Created_At DESC`;
    
    connection.query(query, [clientId], (error, results) => {
        if(error){
            console.log(error);
            response.status(500).send("Unable to fetch bills");
        } else {
            response.status(200).json(results); // Return array of bills
        }
    });
});

// ============ MARK BILL AS PAID ============
// POST endpoint for marking a bill as paid
// Request body: {billId}
app.post('/pay-bill', (request, response) => {
    const {billId} = request.body; // Extract bill ID
    
    // Update bill status to 'paid' and set payment timestamp
    const updateQuery = 'UPDATE Bill SET Bill_Status = "paid", Paid_At = NOW() WHERE BillID = ?';
    
    connection.query(updateQuery, [billId], (error, result) => {
        if(error){
            console.log(error);
            response.status(500).send("Unable to mark bill as paid");
        } else {
            console.log(`Bill ${billId} marked as paid`);
            response.status(200).json({message: "Bill marked as paid"});
        }
    });
});

const PORT = 5050;
app.listen(PORT, () => {
    console.log(`Service Request server listening on port ${PORT}`);
});
