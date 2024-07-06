import express, { Request, Response } from 'express';
import { createLeagues } from './jobs/onetime';
import { createSeasonFixtures, createTeams } from './jobs/frequent';
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

  // *****************************
  // @JOB CREATE TEAMS
  // createTeams();
  /** DESCRIPTION
   * creates teams for active leagues for current year
   */
  // createTeams();
  // *****************************

  // *****************************
  // createSeasonFixtures();
});