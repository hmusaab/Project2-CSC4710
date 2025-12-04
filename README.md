# Project2-CSC4710
We consider the design of a database-driven website for managing home-cleaning services for a contractor, Anna Johnson. A client must register on the website with the following information: first name, last name, address, phone number, email, and credit card information. A unique client ID is generated at registration

The workflow is as follows:
1. Service Request Submission
o A client submits a request for a home cleaning service, specifying:
▪ service address,
▪ type of cleaning (e.g., “basic”, “deep cleaning”, “move-out”),
▪ number of rooms,
▪ preferred date/time,
▪ a proposed budget,
▪ and optional notes (special instructions, e.g., “pet-friendly products
only”).
o Clients can also upload up to 5 photos of their home.

2. Quote & Negotiation
o After receiving the request, Anna can:
    ▪ reject it (with a note explaining why), OR
    ▪ respond with a quote, including:
      ▪ adjusted price,
      ▪ scheduled time window,
      ▪ optional note.
o The client may either accept (→ service order created) or renegotiate by
submitting a counter note (e.g., “too expensive”, “need another time slot”).
o Negotiation continues until accepted or canceled by either party.
^Musaab
3. Service Order & Completion
o Once accepted, an Order is generated, which becomes the service agreement.
o After completion of cleaning, Anna generates a bill linked to the order.

4. Billing & Payment
o Clients can either pay immediately by credit card or dispute the bill with a note.
o Anna can revise the bill (adjustments, discounts, or explanations).
o Negotiation continues until the bill is paid or remains in dispute (disputes may
require external resolution, outside project scope).
^Iffat
Important: Each quote response and bill response must be stored in the database, since they
represent possible evidence in disputes.
Projects from previous semesters:


Workload for this project:
1. Draw an E-R diagram for the system, in particular, use arrows or thick lines to represent
constraints appropriately. Write down your assumptions and justifications briefly and clearly.
Translate the above E-R diagram into a relational model, i.e., write a set of CREATE TABLE
statements. In particular, specify primary key, foreign key and other constraints whenever
possible. 
2. Implement all interfaces and functionality described above and then implement the following
functionality for the Dashboard for Anna Johnson.
3. Frequent clients – List the clients who completed the most service orders.
4. Uncommitted clients – List clients who submitted 3 or more requests but never
completed an order.
5. This month’s accepted quotes – List all quotes agreed upon in a given month
(e.g., December 2024). --> iffat
6. Prospective clients – List clients who registered but never submitted any request.
7. Largest job – List the service requests with the largest number of rooms ever
completed.
8. Overdue bills – List all unpaid bills older than one week.
9. Bad clients – List clients who never paid any overdue bill.
10. Good clients – List clients who always paid their bills within 24 hours of being
generated. --> Musaab


1) https://www.youtube.com/watch?v=nJa_pHEDbFE
