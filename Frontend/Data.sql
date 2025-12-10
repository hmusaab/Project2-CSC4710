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

