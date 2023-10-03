# tu-backend
Backend for the `Transparent Account` project implementing backend of a transparent bank account system.

## Backend Tech Stack
Technologies used for the backend development:
- `Node.js` v. 20.7,
- `TypeScript` v. 5.2,
- `Express` library v. 4.17,
- `Vitest` a unit test framework v. 0.34.5.  

We run this application on [our](https://github.com/KlosStepan/DOKS-tutorial) DigitalOcean `Kubernetes cluster` and distribute it as `Docker image`.  
Version of this API can be checked at http://ppf-be.stkl.cz/v.

## CI/CD Workflows
We have 2 workflows to facilitate `development & deployment` process.
- **Health condition check via set of tests** called [`test.yml`](https://github.com/KlosStepan/tu-backend/blob/main/.github/workflows/test.yml) - runs automatically.
- **Build+Push+Deploy** called [`build-push-deploy.yml`](https://github.com/KlosStepan/tu-backend/blob/main/.github/workflows/build-push-deploy.yml) applies [`deployment.yaml`](https://github.com/KlosStepan/tu-backend/blob/main/config/deployment.yaml) - runs manually.

## REST API Definition
We implement unrestricted endpoints to retrieve public information about bank accounts.

Routes accessible via HTTP protocol
- GET `/accounts`  
- GET `/accounts/:accountNumber/balance`  
- GET `/accounts/:accountNumber/transactions`  

with functions in `src/bankController.ts` returning data
- async function `accounts()`
- async function `balance(accountNumber: number)`
- async function `transactions(accountNumber: number)`  

ready (mocked w/ .json files) for further extensibility.  

Example of endpoint defined in `app.ts` calling function from `bankController.ts`. Folder [`/src`](https://github.com/KlosStepan/tu-backend/tree/main/src).
```ts
import { ..., balance } from './bankController';
...
app.get('/accounts/:accountNumber/balance', async (req, res) => {
  const accountNumber = parseInt(req.params.accountNumber);
  res.send(await balance(accountNumber));
});
```
## Project Description and Functionality
Run ["the build command"](https://github.com/KlosStepan/tu-backend/blob/main/package.json#L8) as `npm run build`, to remove TypeScript and copy dummy-data over to `/dist` folder (not important, but a step between TS and JS). These annotations are present in JavaScript only during development. We define ["the start command"](https://github.com/KlosStepan/tu-backend/blob/main/package.json#L7) in `package.json` that removes TypeScript and starts the backend for local development.

### Example of `npm run start` on local machine

```
> tu-backend@1.0.0 start /Users/stepo/projects/tu-backend
> tsc && cp src/dummy-data/*.json dist && node dist/app.js 

Express is listening at http://localhost:3000
```  
### Endpoint Query, for ex. `GET /accounts`
```
tu-backend git:(main) ✗ curl http://localhost:3000/accounts
[{"currency":"CZK","id":"101010101010","identification":{"iban":"CZ3560000000002002222222","otherAccountNumber":"000000 2002222222"},"name":"Transparent 1","product":"-1","servicer":{"bankCode":"6000","bic":"PMBPCZPP","countryCode":"CZ"}}]
```

### Overview of the Entire Stack during Application Query
When a query is made, the following happens:
- The client (browser) forms a request, e.g. `HTTP GET /accounts`, on the 7th layer and sends it to the `BACKEND_URL` (variable/URL/IP of the backend).
- `(*1)`
- `Express` (in running Node.js backend), serving as a web server, receives and matches the requested route.
- This specific route calls asynchronous function with business logic - in this case, I/O operation `(*2)`.
- After that Node.js delegates the `fs reading` (asynchronous filesystem reading) onto the OS under Node.js processes running our backend. It is dealt with on the OS level using `epoll_wait()` syscall. Then, once reading is finished, `(*3)` callback with response is placed into the `Event Queue`, and `Event Loop` handles response based on `execution priority` of queued callback.

(*1) Between `client browser` and `Node.js application` is usually Kubernetes - where additional routing occurs as follows: `Load balancer` -> |entering Kubernetes| -> `Ingress controller` -> `tu-backend-service` -> specific `Container IP:PORT`.

(*2) Specifically I/O operation for reading from disk. The principle is the same for reading from a database in Node.js or making calls to Web APIs using the Fetch API in the browser.

(*3) The JavaScript runtime is single-threaded, and it works the same way for `Node.js` and `browser` - in Node.js, the primary focus is on asynchronous I/O operations, while in the browser, it involves Web APIs (fetches, timeouts, DOM manipulation through DOM API, etc.). Offtopic for our needs, however, in Node.js it is possible to create a new process, and in browser, a SharedWorker even with running WebAssembly binary compiled from whatever language - but that's way beyond our current requirements.

## Try it out!
```
projects> git clone https://github.com/KlosStepan/tu-backend
projects> cd tu-backend
projects/tu-backend> npm install
projects/tu-backend> npm run start

> tu-backend@1.0.0 start /Users/stepo/projects/tu-backend
> tsc && cp src/dummy-data/*.json dist && node dist/app.js 

Express is listening at http://localhost:3000
```

## Tweaks
- `"main": "dist/app.js",` after removing TypeScript, we put the logic in the `/dist` folder for local and deployment.
- scripts: `"start": "tsc && cp src/dummy-data/*.json dist && node dist/app.js ",` we copy dummy JSON files before starting Node.js.
- scripts: `"clean": "rm -rf dist",` to delete the /dist folder.

## TODOs / Roadmap
- [ ] ~~Write 3 types of tests (ala CRUD) - `basic` (is Node.js running), `endpoints-healthcheck` (poke 3 endpoints), `endpoints-testing` (errors, correct results, HTTP heads, etc.).~~ re: [SwimmPair BE Unit testing](https://github.com/KlosStepan/SwimmPair-Www/blob/master/tests/Unit/ClubsManagerTest.php)
- [ ] ~~Think about dynamical versioning [of API version](https://github.com/KlosStepan/tu-backend/blob/main/src/apiController.ts#L3) during build [ala this](https://github.com/KlosStepan/tu-backend/blob/main/config/deployment.yaml#L29). Maybe sed substitute in src/apiController.ts somehow.~~ WHATEVER for now
- [ ] ~~Improve backend error handling - HTTP Codes 200/400/404, unified error reponses (`bad reponse` / `i/o error`, `timeout`).~~ re: [SwimmPair handling 1 - types](https://github.com/KlosStepan/SwimmPair-Www/blob/master/model/PagesManager.php#L51-L64), [SwimmPair handling 2 - i/o](https://github.com/KlosStepan/SwimmPair-Www/blob/master/model/Sanitizer.php), etc.
- [x] Dockerfile file debug.
- [x] CI/CD deploy into Kubernetes Cluster via docker hub (deployment.yaml as well).
- [x] CI/CD run tests via `npm test`.
- [x] Prepare `backendController.ts` so the logic is easily replacable w/ actual DB - either for ex. [oracledb](http://blog.stkl.cz/2-oracledb-nodejs/), Firebase or whatever db.
- [ ] ~~Better TypeScript utilization on backend.~~ Depends on TypeScript sharing solution (Swagger, API for Types, DB tables->Types during build, etc.)
- [x] Re-read the README.md day before.
