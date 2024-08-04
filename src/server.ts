import express, { Request, Response } from 'express';
import { runBacktest } from './jobs/runBacktest';
import { createFixtures } from './jobs/createFixtures';
import { createTeams } from './jobs/createTeams';

require("dotenv").config();

const app = express();

const port: number = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Root is running...');
});

app.listen(port, () => {
  // createTeams(2023);
  // createFixtures(2023);
  runBacktest();
});