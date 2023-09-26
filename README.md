# tu-backend
Backend k projektu `Transparentní účet` implementující backend bankovního systému transparentního účtu.
## Tech Stack
Využité technologie při tvorbě backendu:
- `Node.js` v. 20.7,
- `TypeScript` v. 5.2,
- knihovna `Express` v. 4.17.  

## REST API  
Implementujeme unrestricted endpointy k získávání veřejných informací.  

Routes: (TODO parametry)
- GET /accounts
- GET /balance
- GET /transactions

## Popis projektu a jeho fungování  
Je třeba provést `build`, který  odstraní TypeScript (build v tomto případě není terminus technicus, pouze "krok"). TypeScript jsou anotace v JavaScriptu přítomné pouze při vývoji. Definujeme příkaz `start` v `package.json`, který odstraní TypeScript & spustí backend.  

### `npm run start`

```
> tu-backend@1.0.0 start /Users/stepo/projects/tu-backend
> tsc && node dist/app.js

Express is listening at http://localhost:3000
```  
### Dotaz na EndPoint, např. `GET /accounts`
```
tu-backend git:(main) ✗ curl http://localhost:3000/accounts
{"response":[{"currency":"CZK","id":"101010101010","identification":{"iban":"CZ3560000000002002222222","otherAccountNumber":"000000 2002222222"},"name":"Transparent 1","product":"-1","servicer":{"bankCode":"6000","bic":"PMBPCZPP","countryCode":"CZ"}}]}
```


### Průřez stacku při dotazu v aplikaci
Při dotazu probíhá následující:
- `klient` (browser) zformuje `HTTP request` např. `GET /accounts` na 7. vrstvě a odešle na `BACKEND_URL` (proměnná/URL/IP backendu),
- `(*1)`,
- `Express` (v Node.js aplikaci) sloužící jako webserver request přijme a "matchne poptávanou route",
- specifická route volá naši `asynchronní funkci` s business logikou - v tomto případě I/O operací `(*2)`
- až OS pod Node.js zpracuje na něj delegované asynchronní čtení z disku realizované pomocí syscallu `epoll_wait()`, (*3) callback s odpovědí se zařadí do `Event Queue` a `Event Loop` vypořádá odpověď, až na tento callback přijde řada dle "execution priorit". 

(*1) Mezi klientem a Node.js aplikací na aplikační vrstvě může být Kubernetes, kde probíhá ještě routing `Load balancer` -> `Ingress controller` -> `Servis tu-backend-service` -> `Container IP:PORT`.

(*2) I/O operace čtení z disku. Principiálně stejně funguje čtení z databáze v Node.js, nebo volání Web APIs `Fetch API` v browseru.

(*3) JavaScript runtime je single threaded a pro `Node.js` a `browser` "funguje stejně" - v Node.js je primární focus asynchronních operací na I/O, v prohlížeči se jedná o Web APIs (fetche, timeouty, manipulace s DOM přes DOM API, atd.). Offtopic pro naše potřeby, v Node.js je možné vytvořit nový process, v browseru zase nové vlákno SharedWorker klidně s běžící WebAssembly binárkou, ale to už je mimo naše aktuální potřeby. 

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
- `"main": "dist/app.js",` po odstraneni TS si hodime logiku do /dist slozky
- scripts: `"start": "tsc && cp src/dummy-data/*.json dist && node dist/app.js ",` kopirujeme dummy JSON soubory pred spustenim Node.js
- scripts: `"clean": "rm -rf dist",` na smazani /dist slozky