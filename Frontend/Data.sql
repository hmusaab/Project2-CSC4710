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
  QuoteID INT AUTO_INCREMENT, 
  RequestID INT,
  Quoted_Price DECIMAL(10,2), 
  Scheduled_Date DATE,
  Scheduled_Time VARCHAR(30),
  Quote_Note TEXT,
  Quote_Status ENUM('pending', 'accepted', 'countered', 'rejected') DEFAULT 'pending', 
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY(QuoteID), 
FOREIGN KEY(RequestID) REFERENCES ServiceRequest(RequestID) 
);

CREATE TABLE Negotiation(
  NegotiationID INT AUTO_INCREMENT,
  QuoteID INT,
  RequestID INT,
  Sender_Type ENUM('client', 'anna'),
  Message TEXT,
  Counter_Price DECIMAL(10,2),
  Counter_Date DATE,
  Counter_Time VARCHAR(30),
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY(NegotiationID),
FOREIGN KEY(QuoteID) REFERENCES Quote(QuoteID),
FOREIGN KEY(RequestID) REFERENCES ServiceRequest(RequestID)
);

CREATE TABLE ServiceOrder(
  OrderID INT AUTO_INCREMENT,
  RequestID INT,
  QuoteID INT,
  ClientID VARCHAR(6),
  Final_Price DECIMAL(10,2),
  Scheduled_Date DATE,
  Scheduled_Time VARCHAR(30),
  Order_Status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  Completion_Date TIMESTAMP NULL,
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY(OrderID),
FOREIGN KEY(RequestID) REFERENCES ServiceRequest(RequestID),
FOREIGN KEY(QuoteID) REFERENCES Quote(QuoteID),
FOREIGN KEY(ClientID) REFERENCES Client(ClientID)
);

CREATE TABLE Bill(
  BillID INT AUTO_INCREMENT,
  OrderID INT,
  ClientID VARCHAR(6),
  Amount DECIMAL(10,2),
  Tax DECIMAL(10,2),
  Total_Amount DECIMAL(10,2),
  Bill_Status ENUM('pending', 'paid', 'disputed', 'revised', 'overdue', 'cancelled') DEFAULT 'pending',
  Bill_Note TEXT,
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Paid_At TIMESTAMP NULL,
  Payment_Method VARCHAR(50),
PRIMARY KEY(BillID),
FOREIGN KEY(OrderID) REFERENCES ServiceOrder(OrderID),
FOREIGN KEY(ClientID) REFERENCES Client(ClientID)
);

CREATE TABLE BillDispute(
  DisputeID INT AUTO_INCREMENT,
  BillID INT,
  ClientID VARCHAR(6),
  Dispute_Reason TEXT,
  Dispute_Status ENUM('open', 'under_review', 'resolved', 'escalated') DEFAULT 'open',
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Resolved_At TIMESTAMP NULL,
PRIMARY KEY(DisputeID),
FOREIGN KEY(BillID) REFERENCES Bill(BillID),
FOREIGN KEY(ClientID) REFERENCES Client(ClientID)
);

CREATE TABLE BillRevision(
  RevisionID INT AUTO_INCREMENT,
  BillID INT,
  DisputeID INT,
  Previous_Amount DECIMAL(10,2),
  New_Amount DECIMAL(10,2),
  Previous_Tax DECIMAL(10,2),
  New_Tax DECIMAL(10,2),
  Previous_Total DECIMAL(10,2),
  New_Total DECIMAL(10,2),
  Revision_Type ENUM('adjustment', 'discount', 'correction') DEFAULT 'adjustment',
  Revision_Note TEXT,
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY(RevisionID),
FOREIGN KEY(BillID) REFERENCES Bill(BillID),
FOREIGN KEY(DisputeID) REFERENCES BillDispute(DisputeID)
);

CREATE TABLE PaymentRecord(
  PaymentID INT AUTO_INCREMENT,
  BillID INT,
  ClientID VARCHAR(6),
  Amount_Paid DECIMAL(10,2),
  Payment_Method VARCHAR(50),
  Card_Last_Four VARCHAR(4),
  Payment_Status ENUM('processing', 'completed', 'failed', 'refunded') DEFAULT 'processing',
  Transaction_ID VARCHAR(100),
  Payment_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY(PaymentID),
FOREIGN KEY(BillID) REFERENCES Bill(BillID),
FOREIGN KEY(ClientID) REFERENCES Client(ClientID)
);

