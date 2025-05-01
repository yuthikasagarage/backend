Cool i will write my thoughts here
1st problem.

ok first one classic floating point issue. 
so basic use toFixed

also why 201 here nothing got created. send 200 instead
doesn't say whether this needs to be a number or string we can keep it string or number. i opted for number

second problem.


ok there's a user balance, so this has a wallet . 
and probably user can top up or deposit funds and buy things from the wallet balance.


and this is a very large product. but i assume then this has at least dau of 100000 something.
and very large number of employees. so basically they have teams for every aspect. 

so . with a wallet comes a risk. need to be financially compliant and have audit and ledger logs.
i know this first hand since, adding a wallet balance is like a maintaining a bank account.

cool, anyway now user should be able to look at his balance. but for now i can see the db has
{
id: 'user1',
name: 'Alice',

        balance: 9.21,
    },
i don't know why it's like this but what i would do is , have a balance and pending holds or something like booked balance, available balance and have userid 
name doesn't belong in this domain. 

i would probably have a seperate balance api, and orders api, and audit api 
with seperate dbs, with outboxes connected to cdc such as debezium with an reservation or some reference id for idempotency purposes as this assumes already have a db.
as these systems have dual write problem anyway. 


when order is created maybe call balance check with grpc then allocate funds, pending hold with a for key update lock for the columnn
then if the balance is there create an order and process it  once done order db outbox emit event balance api consumes it and make it proper, 
in the meantime some notification service connected to frontend with a ws can probably show the user that funds allocated just when it happens
this locking will make sure user can only make orders that is in the available balance. 


so anyway coming to the question again , from an ingress you can make it like api/balance request so frontend engineer can take it easy without 
having to call on a seperate endpoint .lb and ingress will take care of that.

and then maybe for the calculate the balance at any point in time using the order history,
if this is a large scale production one, 

ok maybe its easy to write this in mermaid

lets see. i'm taking some time to draw a sequence diagram here. 
```mermaid
sequenceDiagram
    
    participant Frontend
    participant OrderSvc as Order Service
    participant BalanceSvc as Balance Service
    participant SharedDB as Shared DB 
    participant Kafka as Kafka
    participant QLDB as Amazon QLDB
    participant AuditAPI as Audit API
    participant Admin as Admin
    
    Note over SharedDB: this is a simplictic view
    Frontend->>OrderSvc: Create Order 80
    OrderSvc->>BalanceSvc: CheckAndReserveBalance(userId, 80) grpc call
    BalanceSvc->>SharedDB: Reserve funds (add to pending holds) 
    BalanceSvc->>SharedDB: Write to balance_outbox
    BalanceSvc-->>OrderSvc: Success: available: 20
    OrderSvc->>SharedDB: Create order + Write to order_outbox
    OrderSvc-->>Frontend: Order Charged 

    SharedDB->>Kafka: CDC publishes events BalanceReserved, OrderCharged etc
    
    Kafka->>QLDB: Stream all financial events
    
    Admin->>AuditAPI: GET /users/{id}/balance?timestamp=2023-05-10T14:30:00Z
    
    AuditAPI->> QLDB: Query events up to timestamp
    
    QLDB-->>AuditAPI: SELECT * FROM events WHERE userId='user123' AND time <= '2023-05-10T14:30:00Z'
    
    
    AuditAPI-->>Admin: {balance: $X, timestamp: "2023-05-10T14:30:00Z"}
  ```

ok something like this very rudimentary normal wallet setup. but have a seperate audit api so users won't be affected with any of the admin requests.
here i added a shared db for the diagrams sake but i would just keep it two seperate dbs if we are at scale . 
so basically kafka streams to qldb . of course needs to be audit compliant. qldb is one of the easiest to setup, so 
and maybe you can make snapshots to make it even faster to query from the backend engineers or audits.


cool for now i cannot do everything so i'll just make another server and use the same db with grpc call
i'll try to setup a docker compose with the time i have, lets see.










