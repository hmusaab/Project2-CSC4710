CREATE TABLE Client(
  FirstName VARCHAR(50), -- name of category/column (no spaces, use underscore if needed) followed by datatype. Name for column/category can also have symbols and numbers but cannot start with such characters --
  LastName VARCHAR(50),
  Primary_Address VARCHAR(30),
  Phone_Number INT(30),
  Email VARCHAR(30),
  CreditCardNumber VARCHAR(50),
  CreditCardCode VARCHAR(50),
  ClientID VARCHAR(6),
PRIMARY KEY(ClientID) -- PRIMARY KEY is a key word not a category/column name. It dsitinguishes every column/category from the others in the table --
);

CREATE TABLE ServiceRequest(
  Service_Address VARCHAR(50), -- name of category/column (no spaces, use underscore if needed) followed by datatype. Name for column/category can also have symbols and numbers but cannot start with such characters --
  Cleaning_Type VARCHAR(50),
  Rooms VARCHAR(30),
  Pref_Date INT(30),
  Pref_Time VARCHAR(30),
  Pref_Budget VARCHAR(50),
  Optional_Note VARCHAR(50),
PRIMARY KEY(Pref_Time) -- PRIMARY KEY is a key word not a category/column name. It dsitinguishes every column/category from the others in the table --
);


CREATE TABLE Quote(
  QuoteID INT AUTO_INCREMENT, -- Unique identifier for each quote --
  RequestID INT, -- References the service request this quote is for --
  Quoted_Price DECIMAL(10,2), -- Price quoted by Anna for the service --
  Scheduled_Date DATE, -- Date scheduled by Anna for the service --
  Scheduled_Time VARCHAR(30), -- Time scheduled by Anna for the service --
  Quote_Note TEXT, -- Optional note from Anna explaining the quote --
  Quote_Status ENUM('pending', 'accepted', 'countered', 'rejected') DEFAULT 'pending', -- Status of the quote (pending/accepted/countered/rejected) --
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When the quote was created --
PRIMARY KEY(QuoteID), -- PRIMARY KEY is a key word not a category/column name. It dsitinguishes every column/category from the others in the table --
FOREIGN KEY(RequestID) REFERENCES ServiceRequest(RequestID) -- Links to the ServiceRequest table --
);

CREATE TABLE Negotiation(
  NegotiationID INT AUTO_INCREMENT, -- Unique identifier for each negotiation message --
  QuoteID INT, -- References the quote being negotiated --
  RequestID INT, -- References the service request being negotiated --
  Sender_Type ENUM('client', 'anna'), -- Who sent this negotiation message (client or anna) --
  Message TEXT, -- The negotiation message or note --
  Counter_Price DECIMAL(10,2), -- Counter-offer price (optional) --
  Counter_Date DATE, -- Counter-offer date (optional) --
  Counter_Time VARCHAR(30), -- Counter-offer time (optional) --
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When this negotiation message was sent --
PRIMARY KEY(NegotiationID), -- PRIMARY KEY is a key word not a category/column name. It dsitinguishes every column/category from the others in the table --
FOREIGN KEY(QuoteID) REFERENCES Quote(QuoteID), -- Links to the Quote table --
FOREIGN KEY(RequestID) REFERENCES ServiceRequest(RequestID) -- Links to the ServiceRequest table --
);

CREATE TABLE ServiceOrder(
  OrderID INT AUTO_INCREMENT, -- Unique identifier for each service order --
  RequestID INT, -- References the original service request --
  QuoteID INT, -- References the accepted quote --
  ClientID VARCHAR(6), -- References the client who placed the order --
  Final_Price DECIMAL(10,2), -- Final agreed upon price --
  Scheduled_Date DATE, -- Final scheduled date for the service --
  Scheduled_Time VARCHAR(30), -- Final scheduled time for the service --
  Order_Status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled', -- Current status of the service order --
  Completion_Date TIMESTAMP NULL, -- When the service was completed --
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When the order was created --
PRIMARY KEY(OrderID), -- PRIMARY KEY is a key word not a category/column name. It dsitinguishes every column/category from the others in the table --
FOREIGN KEY(RequestID) REFERENCES ServiceRequest(RequestID), -- Links to the ServiceRequest table --
FOREIGN KEY(QuoteID) REFERENCES Quote(QuoteID), -- Links to the Quote table --
FOREIGN KEY(ClientID) REFERENCES Client(ClientID) -- Links to the Client table --
);

CREATE TABLE Bill(
  BillID INT AUTO_INCREMENT, -- Unique identifier for each bill --
  OrderID INT, -- References the service order this bill is for --
  ClientID VARCHAR(6), -- References the client being billed --
  Amount DECIMAL(10,2), -- Total amount to be paid --
  Tax DECIMAL(10,2), -- Tax amount --
  Total_Amount DECIMAL(10,2), -- Final total including tax --
  Bill_Status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending', -- Payment status --
  Bill_Note TEXT, -- Optional notes about the bill --
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When the bill was generated --
  Paid_At TIMESTAMP NULL, -- When the bill was paid --
PRIMARY KEY(BillID), -- PRIMARY KEY is a key word not a category/column name. It dsitinguishes every column/category from the others in the table --
FOREIGN KEY(OrderID) REFERENCES ServiceOrder(OrderID), -- Links to the ServiceOrder table --
FOREIGN KEY(ClientID) REFERENCES Client(ClientID) -- Links to the Client table --
);

