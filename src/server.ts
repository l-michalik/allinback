import express, { Request, Response } from "express";
import { Telegram } from "./lib/telegram";
import { updateSeasonFixtures, createTeams, getDailyPredictions, getDailyUpdate } from "./jobs/frequent";
import { createLeagues } from "./jobs/onetime";
require("dotenv").config();
const app = express();

const port: number = 3001;

app.get("/", (req: Request, res: Response) => {
  res.send("Root is running...");
});

app.listen(port, () => {

  // *****************************
  // @JOB
  // desc : create all available leagues
  // createLeagues();
  // *****************************

  // *****************************
  // @JOB
  // desc : create teams based on leagues id's for specific year
  // params : year = 2021
  createTeams(2024);
  // *****************************

  // *****************************
  // @JOB
  // desc : create fixtures based on leagues id's for specific year
  // params : year = 2021
  // updateSeasonFixtures(2024);
  // *****************************

  // *****************************
  // getDailyUpdate();


  // 
  // getDailyPredictions();
  // runBackTest();
});
