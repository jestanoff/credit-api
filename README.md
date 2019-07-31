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
  dateUpdated: '2019-07-31T09:25:16.091Z',
  id: '1000-0000-0000-0001',
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
  balance: 50,
  dateCreated: '2019-07-31T09:25:16.091Z',
  dateUpdated: '2019-07-31T09:25:16.091Z',
  id: '1000-0000-0000-0001',
  transactions: [],
},
{
  balance: 20,
  dateCreated: '2019-06-02T19:32:33.100Z',
  dateUpdated: '2019-06-02T19:32:33.100Z',
  id: '1000-0000-0000-0002',
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
  balance: 50,
  dateCreated: '2019-07-31T09:25:16.091Z',
  dateUpdated: '2019-07-31T09:25:16.091Z',
  id: '1000-0000-0000-0001',
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
  balance: 113,
  dateCreated: '2019-07-31T09:25:16.091Z',
  dateUpdated: '2019-08-01T10:25:16.091Z',
  id: '1000-0000-0000-0001',
  transactions: [{
    amount: 100,
    date: '2019-08-01T10:25:16.091Z',
    id: '0AEAB3F5-3904-486D-8BF5-DCEE2E54444C',
    type: 'deposit',
  }],
}
```


## Withdraws amount from a card
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
  balance: 63,
  dateCreated: '2019-07-31T09:25:16.091Z',
  dateUpdated: '2019-08-01T10:25:16.091Z',
  id: '1000-0000-0000-0001',
  transactions: [{
    amount: 100,
    date: '2019-07-29T09:25:16.091Z',
    id: '0AEAB3F5-3904-486D-8BF5-DCEE2E54444C',
    type: 'deposit',
  }, {
    amount: 50,
    date: '2019-08-01T10:25:16.091Z',
    id: 'ECA23640-BB59-4326-A067-20234D24B7E7',
    type: 'withdraw',
  }],
}
```

e.g. https://github.com/johnph/simple-transaction
