import express, { Request, Response } from 'express';
import { createFixtures } from './jobs/createFixtures';

require("dotenv").config();

const app = express();

const port: number = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Root is running...');
});

app.listen(port, () => {
  createFixtures(2023);
});