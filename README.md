# API Server app
First run MongoDB manually as a background process
> mongod --config /usr/local/etc/mongod.conf --fork

Then start the express application
> yarn server


# Client proxy app
The client application is a simple proxy that translates the serial port 12 bits commands to http API requests and then the responses to 12 bits commands.

To run the client application:
> yarn client

# Car Wash RESTful API

## Create new card
#### **POST /cards/{id}**

Request
```javascript
{
  authToken: 'hash',
}
```

Response
```javascript
{
  balance: 0,
  created: '2019-07-31T09:25:16.091Z',
  id: '1000-0000-0000-0001',
  status: 201,
  transactions: [],
}
```

## Get all cards
#### **GET /cards**

Request 
```javascript
{
  authToken: 'hash',
}
```

Response
```javascript
[
  {
    balance: 50,
    created: '2019-07-31T09:25:16.091Z',
    id: '1000-0000-0000-0001',
    transactions: [],
  },
  {
    balance: 20,
    created: '2019-06-02T19:32:33.100Z',
    id: '1000-0000-0000-0002',
    transactions: [],
  },
  status: 200,
]
```

## Get specific card
#### **GET /cards/{id}**

Request 
```javascript
{
  authToken: 'hash'
}
```
Response
```javascript
{
  balance: 50,
  dateCreated: '2019-07-31T09:25:16.091Z',
  id: '1000-0000-0000-0001',
  status: 200,
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

## Get a card balance 
#### **GET /cards/{id}/balance**
Request 
```javascript
{
  authToken: 'hash',
}
```
Response
```javascript
{
  balance: 100,
  id: '1000-0000-0000-0001',
  status: 200,
}
```

## Deposit amount to a card
#### **POST /cards/{id}/deposit**

Request 
```javascript
{
  authToken: 'hash',
  body: {
    amount: 100,
  },
}
```
Response
```javascript
{
  balance: 200,
  id: '1000-0000-0000-0001',
  status: 201,
}
```


## Withdraw amount from a card
#### **POST /cards/{id}/withdraw**

Request 
```javascript
{
  authToken: 'hash',
  body: {
    amount: 50,
  },
}
```
Response
```javascript
{
  balance: 50,
  id: '1000-0000-0000-0001',
  status: 201,
}
```

## Authenticate a user
#### **POST /authenticate**
Request
```javascript
{
  body: {
    username: 'admin',
    password: '12345',
  },
}
```
Response
```javascript
{
  status: 201,
  message: 'Authentication done',
  token: 'hash',
}
```

e.g. https://github.com/johnph/simple-transaction

# Client - Server diagrams
https://docs.google.com/presentation/d/1oUWIE6T0oV_S-eZf13f7RbZdkD03_O2w0njMzLBtVt4/edit?usp=sharing
