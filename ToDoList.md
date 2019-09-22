# TODO LIST
* ~~Fix withdraw and deposit~~
* ~~Add Unit tests (Mocha, Chai and SuperTest or Jest~~
1) Create a client app (bridge app on the raspberry to communicate with terminals and API server)
2) Dockerize Client app
3) Dockerize Server app
4) Deploy server app to AWS (lambda or not)?
5) Integrate ACME to auto generate Let's encrypt certificates (server only) https://blog.usejournal.com/setting-up-a-ufw-secured-nginx-reverse-proxy-with-http-authentication-and-tls-certificates-from-b1103d67779f
6) Add Functional tests BE (done locally with fresh DB) - using Cucumber, Springboot equivalent 
7) Add Integration (E2E) tests (done on stage env with persistent DB) - using Cucumber
8) Add admin app
  - Setup React
  - Login form for admins
  - Store credentials securely
  - View to list all cards, sort options
  - Pagination + GET /cards pagination support 
  - View a single card details and transactions
  - Top-up particular card
9) Dockerize Admin app