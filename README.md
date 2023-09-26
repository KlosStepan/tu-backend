# tu-backend
Backend for the `Transparent Account` project implementing the backend of a transparent bank account system.

## Backend Tech Stack
Technologies used in the backend development:
- `Node.js` v. 20.7,
- `TypeScript` v. 5.2,
- `Express` library v. 4.17.

## CI/CD Workflows
We have 2 workflows to support our backend project.
- **Health condition check via set of tests** called `test.yml` - automatic.
- **Build+Push+Deploy** called `build-push-deploy.yml` - manual.

## REST API
We implement unrestricted endpoints to retrieve public information about account.

Routes
- GET `/accounts`  
- GET `/accounts/:accountNumber/balance`  
- GET `/accounts/:accountNumber/transactions`  

with functions in `src/bankController.ts` returning data
- async function `accounts()`
- async function `balance(accountNumber: number)`
- async function `transactions(accountNumber: number)`  

ready (mocked w/ .json files) ready for further extensibility.  
```ts
app.get('/accounts/:accountNumber/balance', async (req, res) => {
  const accountNumber = parseInt(req.params.accountNumber);
  res.send(await balance(accountNumber));
});
```
## Project Description and Functionality
To build, run the `build` command, which removes TypeScript (in this case, "build" is not a technical term, just a step). TypeScript annotations are present in JavaScript only during development. We define a `start` command in `package.json` that removes TypeScript and starts the backend.

### `npm run start`

```
> tu-backend@1.0.0 start /Users/stepo/projects/tu-backend
> tsc && node dist/app.js

Express is listening at http://localhost:3000
```  
### Endpoint Query, for example, `GET /accounts`
```
tu-backend git:(main) ✗ curl http://localhost:3000/accounts
{"response":[{"currency":"CZK","id":"101010101010","identification":{"iban":"CZ3560000000002002222222","otherAccountNumber":"000000 2002222222"},"name":"Transparent 1","product":"-1","servicer":{"bankCode":"6000","bic":"PMBPCZPP","countryCode":"CZ"}}]}
```



### Overview of the Entire Stack during Application Query
When a query is made, the following happens:
- The client (browser) forms an HTTP request, e.g., `GET /accounts`, at the 7th layer and sends it to the `BACKEND_URL` (variable/URL/IP of the backend).
- (*1)
- `Express` (in the Node.js application), serving as a web server, receives and matches the requested route.
- The specific route calls our asynchronous function with business logic - in this case, I/O operations (*2).
- Once the OS under Node.js processes the asynchronously delegated disk reading, realized using the `epoll_wait()` syscall, (*3) the callback with the response is placed in the `Event Queue`, and the `Event Loop` handles the response when it's the turn of execution priority.

(*1) Between the client and the Node.js application at the application layer, there may be Kubernetes, where routing still occurs: `Load balancer` -> `Ingress controller` -> `tu-backend-service` -> `Container IP:PORT`.

(*2) I/O operations for reading from disk. The principle is the same for reading from a database in Node.js or making calls to Web APIs using the Fetch API in the browser.

(*3) The JavaScript runtime is single-threaded, and it works the same way for `Node.js` and the browser - in Node.js, the primary focus is on asynchronous I/O operations, while in the browser, it involves Web APIs (fetches, timeouts, DOM manipulation through DOM API, etc.). Off-topic for our needs, in Node.js, it's possible to create a new process, and in the browser, a new thread with a running WebAssembly binary, but that's beyond our current requirements.

## Try it out
```
projects> git clone https://github.com/KlosStepan/tu-backend
projects> cd tu-backend
projects/tu-backend> npm install
projects/tu-backend> npm run start

> tu-backend@1.0.0 start /Users/stepo/projects/tu-backend
> tsc && cp src/*.json dist && node dist/app.js 

Express is listening at http://localhost:3000
```

## Tweaks
- `"main": "dist/app.js",` after removing TypeScript, we put the logic in the /dist folder.
- scripts: `"start": "tsc && cp src/dummy-data/*.json dist && node dist/app.js ",` we copy dummy JSON files before starting Node.js.
- scripts: `"clean": "rm -rf dist",` to delete the /dist folder.

## TODOs
- [ ] tests - basic (is Node.js running), endpoints-healthcheck (poke 3 endpoints), endpoints-testing (errors, correct results, HTTP heads, etc.)
- [ ] Dockerfile fine
- [ ] CI/CD into Kubernetes Cluster via docker hub (deployment.yaml as well)
