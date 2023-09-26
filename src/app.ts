import express from 'express';
const app = express();
const port = 3000;

import { accounts, balance, transactions } from './bankaController';

/*app.get('/', (req, res) => {
  res.send('Hello World!');
});*/

app.get('/accounts', async (req, res) => {
  res.send(await accounts());
});

app.get('/balance', async (req, res) => {
  res.send(await balance());
});

app.get('/transactions', async (req, res) => {
  res.send(await transactions());
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
