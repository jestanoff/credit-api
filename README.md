# Car Wash RESTful API

### **POST /api/cards**

Request
```javascript
{
    apiKey: 'hash',
    cardID: ’34bits string’,
    balance: 50.00,
}
```

Response
```javascript
{
    cardID: ’34bits string’,
    balance: 50.00,
    dateCreated: ‘1232152412323’,
    lastTransactionDate: [],
    status: 201,
}
```

### **GET /api/cards**

Request 
```javascript
{
    apiKey: 'hash',
}
```

Response
```javascript
{
    id: ’34bits string’,
    balance: 50.00,
    dateCreated: ‘1232152412323’,
    status: 200,
    transactions: [],
}
```

### **GET /api/cards/{cardID}**

Request 
```javascript
{
    apiKey: 'hash',
}
```
Response
```javascript
{
    id: ’34bits string’,
    balance: 50.00,
    dateCreated: ‘1232152412323’,
    status: 200,
    transactions: [],
}
```

### **PUT /api/cards/{cardID}**

Request 
```javascript
{
    apiKey: 'hash',
    purchase: 10.50
}
```
Response
```javascript
{
    id: ’34bits string’,
    balance: 39.50,
    dateCreated: ‘1232152412323’,
    status: 200,
    transactions: [{
       currentBalance: 25.30,
       date: ‘123213123313’,
       value: 10.50
    }],
}
```

