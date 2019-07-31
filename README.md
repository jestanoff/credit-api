# Car Wash RESTful API

## Add new card
#### **POST /cards**

Request
```javascript
{
  apiKey: 'hash',
}
```

Response
```javascript
{
  balance: 0,
  dateCreated: '2019-07-31T09:25:16.091Z',
  id: 'BC673347-3E6C-4FD5-B6FB-2D375E60A204',
  transactions: [],
  status: 201,
}
```

## List all cards
#### **GET /cards**

Request 
```javascript
{
  apiKey: 'hash',
}
```

Response
```javascript
[{
  balance: 50.00,
  dateCreated: '2019-07-31T09:25:16.091Z',
  id: 'BC673347-3E6C-4FD5-B6FB-2D375E60A204',
  status: 200,
  transactions: [],
}]
```

## Retrieve specific cards
#### **GET /cards/{id}**

Request 
```javascript
{
  apiKey: 'hash'
}
```
Response
```javascript
{
  cardNumber: '10000001',
  balance: 50.00,
  dateCreated: '2019-07-31T09:25:16.091Z',
  id: 'BC673347-3E6C-4FD5-B6FB-2D375E60A204',
  status: 200,
  transactions: [],`
}
```

## Retrieve account balance
#### **GET /cards/{id}/balance**

Request 
```javascript
{
  apiKey: 'hash',
}
```
Response
```javascript
{
  balance: 15.30,
}
```

## Deposits amount to a card
#### **PATCH /cards/{id}/deposit**

Request 
```javascript
{
  apiKey: 'hash',
  body: {
    amount: 100.00,
  },
}
```
Response
```javascript
{
  cardNumber: '10000001',
  balance: 113.50,
  dateCreated: '2019-07-31T09:25:16.091Z',
  id: 'BC673347-3E6C-4FD5-B6FB-2D375E60A204',
  status: 200,
  transactions: [{
    amount: 100.00,
    cardId: 'BC673347-3E6C-4FD5-B6FB-2D375E60A204',
    date: '2019-07-29T09:25:16.091Z',
    id: '0AEAB3F5-3904-486D-8BF5-DCEE2E54444C',
    type: 'debit',
  }],
}
```


## Withdraws amount to a card
#### **PATCH /cards/{id}/withdraw**

Request 
```javascript
{
  apiKey: 'hash',
  body: {
    amount: 50.00,
  },
}
```
Response
```javascript
{
  cardNumber: '10000001',
  balance: 63.50,
  dateCreated: '2019-07-31T09:25:16.091Z',
  id: 'BC673347-3E6C-4FD5-B6FB-2D375E60A204',
  status: 200,
  transactions: [{
    amount: 100.00,
    cardId: 'BC673347-3E6C-4FD5-B6FB-2D375E60A204',
    date: '2019-07-29T09:25:16.091Z',
    id: '0AEAB3F5-3904-486D-8BF5-DCEE2E54444C',
    type: 'deposit',
  }, {
    amount: 50.00,
    cardId: 'BC673347-3E6C-4FD5-B6FB-2D375E60A204',
    date: '2019-07-29T11:10:15.111Z',
    id: 'ECA23640-BB59-4326-A067-20234D24B7E7',
    type: 'credit',
  }],
}

e.g. https://github.com/johnph/simple-transaction
