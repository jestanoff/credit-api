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
    cardID: ’34bits string’,
    balance: 50.00,
    dateCreated: ‘1232152412323’,
    transactions: [],
    status: 200,
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
    cardID: ’34bits string’,
    balance: 50.00,
    dateCreated: ‘1232152412323’,
    transactions: [],
    status: 200,
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
    cardID: ’34bits string’,
    balance: 39.50,
    dateCreated: ‘1232152412323’,
    transactions: [{
       Datetime: ‘123213123313’,
       Balance: 25.30,
       value: 10.50
    }],
    status: 200,
}
```

