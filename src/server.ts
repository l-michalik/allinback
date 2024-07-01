import express, { Request, Response } from 'express';
import { createLeagues } from './jobs/onetime/createLeagues';
require('dotenv').config()
const app = express();

const port: number = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Root is running...');
});

app.listen(port, () => {
  // *****************************

  // @JOB CREATE LEAGUES
  // createLeagues();

  // *****************************
});