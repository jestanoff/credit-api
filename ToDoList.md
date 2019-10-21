# TODO LIST
1. ~~Create Swagger and API architecture~~
2. ~~Create Server API~~
    - ~~Fix withdraw and deposit~~
3. ~~Add Unit tests (Mocha, Chai and SuperTest or Jest~~
4. Create a client app (bridge app on the raspberry to communicate with terminals and API server)
5. Dockerize Client app
    - create
    - integrate with GitLab packages
6. Dockerize Server app
7. Deploy server app to AWS (lambda or not)?
8. Integrate ACME to auto generate Let's encrypt certificates (server only) [Let’s Encrypt](https://blog.usejournal.com/setting-up-a-ufw-secured-nginx-reverse-proxy-with-http-authentication-and-tls-certificates-from-b1103d67779f)
9. Joi to validate req object on requests
10. Add Functional tests BE (done locally with fresh DB)
    - Use Cucumber and Springboot equivalent 
11. Add Integration (E2E) tests (done on stage env with persistent DB) - using Cucumber
12. Add admin app
    - Setup React
    - Login form for admins
    - Store credentials securely
    - View to list all cards, sort options
    - Pagination + GET /cards pagination support 
    - View a single card details and transactions
    - Top-up particular card
13. Dockerize Admin app
14. Improve auth security
    - stronger credentials
    - whitelist ips  
15. Continued Integration / Continued Deployment on GitLab
16. Sort errors handling [Error Handling in node.js](https://www.joyent.com/node-js/production/design/errors)
17. Introduce server and client logging. Best if we get a good free logging framework
