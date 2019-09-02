# TODO LIST
* Dockerize server and client apps
* Integrate ACME to auto generate Let's encrypt certificates (server only)
* Add Unit tests (Mocha, Chai and SuperTest or Jest - https://codehandbook.org/unit-test-express-route/ and https://codewithhugo.com/testing-an-express-app-with-supertest-moxios-and-jest/)
* Add Functional tests (done locally with fresh DB) - using Cucumber, Springboot equivalent 
* Add Integration (E2E) tests (done on stage env with persistent DB) - using Cucumber
* Deploy server app to AWS (lambda or not)?
* Create a client app (bridge app on the raspberry to communicate with terminals and API server)
* Add admin app
  - Setup React
  - Login form for admins
  - View to list all cards, sort options
  - Pagination + GET /cards pagination support 
  - View a single card details and transactions
  - Top-up particular card