import express from 'express';
const app = express();
const port = 3000;

import { accounts, balance, transactions } from './bankController';
import { returnApiVersion } from './apiController';
//Hello World!
/*app.get('/', (req, res) => {
  res.send('Hello World!');
});*/

//REST API version
app.get('/v', (req, res) => {
  res.send(returnApiVersion());
});

//REST API 3 endpoints
app.get('/accounts', async (req, res) => {
  res.send(await accounts());
});

app.get('/accounts/:accountNumber/balance', async (req, res) => {
  const accountNumber = parseInt(req.params.accountNumber);
  res.send(await balance(accountNumber));
});

app.get('/accounts/:accountNumber/transactions', async (req, res) => {
  const accountNumber = parseInt(req.params.accountNumber);
  res.send(await transactions(accountNumber));
});

//Start webserver
app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
