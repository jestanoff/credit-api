# Car Wash RESTful API

## Add new card
#### **POST /cards**

Request
```javascript
{
  authKey: 'hash',
}
```

Response
```javascript
{
  balance: 0,
  dateCreated: '2019-07-31T09:25:16.091Z',
  id: 'BC673347-3E6C-4FD5-B6FB-2D375E60A204',
  transactions: [],
}
```

## List all cards
#### **GET /cards**

Request 
```javascript
{
  authKey: 'hash',
}
```

Response
```javascript
[{
  cardNumber: '10000001',
  balance: 50,
  dateCreated: '2019-07-31T09:25:16.091Z',
  id: 'BC673347-3E6C-4FD5-B6FB-2D375E60A204',
  transactions: [],
},
{
  cardNumber: '10000002',
  balance: 20,
  dateCreated: '2019-06-02T19:32:33.100Z',
  id: '2D37BC673347-B6FB-SD22-3E6C-5E60A204',
  transactions: [],
}]
```

## Retrieve specific cards
#### **GET /cards/{id}**

Request 
```javascript
{
  authKey: 'hash'
}
```
Response
```javascript
{
  cardNumber: '10000001',
  balance: 50,
  dateCreated: '2019-07-31T09:25:16.091Z',
  id: 'BC673347-3E6C-4FD5-B6FB-2D375E60A204',
  transactions: [],`
}
```

## Deposits amount to a card
#### **PATCH /cards/{id}/deposit**

Request 
```javascript
{
  authKey: 'hash',
  body: {
    amount: 100,
  },
}
```
Response
```javascript
{
  cardNumber: '10000001',
  balance: 113,
  dateCreated: '2019-07-31T09:25:16.091Z',
  id: 'BC673347-3E6C-4FD5-B6FB-2D375E60A204',
  transactions: [{
    amount: 100,
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
  authKey: 'hash',
  body: {
    amount: 50,
  },
}
```
Response
```javascript
{
  cardNumber: '10000001',
  balance: 63,
  dateCreated: '2019-07-31T09:25:16.091Z',
  id: 'BC673347-3E6C-4FD5-B6FB-2D375E60A204',
  transactions: [{
    amount: 100,
    date: '2019-07-29T09:25:16.091Z',
    id: '0AEAB3F5-3904-486D-8BF5-DCEE2E54444C',
    type: 'debit',
  }, {
    amount: 50,
    date: '2019-07-29T11:10:15.111Z',
    id: 'ECA23640-BB59-4326-A067-20234D24B7E7',
    type: 'credit',
  }],
}
```

e.g. https://github.com/johnph/simple-transaction
