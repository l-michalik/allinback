import express, { Request, Response } from "express";
import { Telegram } from "./lib/telegram";
import { createSeasonFixtures, createTeams, getDailyPredictions, getDailyUpdate, updateTeamForm } from "./jobs/frequent";
import { createLeagues } from "./jobs/onetime";
require("dotenv").config();
const app = express();

const port: number = 3001;

app.get("/", (req: Request, res: Response) => {
  res.send("Root is running...");
});

app.listen(port, () => {
  // la liga/premier league/seria a/bundesliga/ligue one
  // 140/39/135/78/61

  // *****************************
  // @JOB
  // desc : create all available leagues
  // createLeagues();
  // *****************************

  // *****************************
  // @JOB
  // desc : create teams based on leagues id's for specific year
  // params : year = 2021
  // createTeams(2024);
  // *****************************

  // *****************************
  // @JOB
  // desc : create fixtures based on leagues id's for specific year
  // params : year = 2021
  // createSeasonFixtures(2024);
  // *****************************

  // *****************************
  // @JOB
  // desc : update form for teams based on last 5 matches
  // updateTeamForm();
  // *****************************

  // *****************************
  getDailyUpdate();


  // 
  // getDailyPredictions();
  // runBackTest();
});
