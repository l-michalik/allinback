import { createOptions, isArrayEmpty } from "../utils";
import { Statistic } from "../models/Statistic";
import { Fixture } from "../models/Fixtures";
import { testLeagues } from "../constants";
import { League } from "../models/Leagues";
import dbConnect from "../lib/dbConnect";
import { Team } from "../models/Teams";
import axios from "axios";

export const createFixtures = async (year: number) => {
  let documents: any[] = [];
  const leaguesModels = [];
  let teamsCreated = 1;

  try {
    await dbConnect();

    const leagues = await League.find({
      id: { $in: testLeagues },
    }).select("id name");

    leaguesModels.push(...leagues);
  } catch (error) {
    console.log(error);
  }

  leaguesModels.forEach((ligue, idx) => {
    setTimeout(async () => {
      const options = createOptions({
        path: "fixtures",
        params: {
          league: `${ligue.id}`,
          season: `${year}`,
          timezone: "Europe/Warsaw",
        },
      });

      documents = [];

      try {
        const response = await axios.request(options);

        const documentsPromises = Promise.all(
          response.data.response.map(async (doc: any) => {
            const fixture = doc.fixture;
            const score = doc.score;
            const goals = doc.goals;
            const teams = doc.teams;

            const [_League, _Home, _Away, _Statistic] = await Promise.all([
              League.findOne({ id: ligue.id }).select("_id"),
              Team.findOne({ id: teams.home.id }).select("_id"),
              Team.findOne({ id: teams.away.id }).select("_id"),
              
              Statistic.create({
                id: fixture.id,
                goals: {
                  home: goals.home,
                  away: goals.away,
                },
                score: {
                  halftime: {
                    home: score.halftime.home,
                    away: score.halftime.away,
                  },
                },
              }),
            ]);

            return {
              id: fixture.id,
              timestamp: fixture.timestamp,
              league: _League,
              statistic: _Statistic,
              teams: {
                home: _Home,
                away: _Away,
              },
            };
          })
        );

        const documents = (await documentsPromises).flat();

        if (isArrayEmpty(documents)) return;

        await dbConnect();

        await Fixture.insertMany(documents);

        console.log(
          `Season fixtures for ${ligue.name} : ${year} updated successfully! [${documents.length}] | ${teamsCreated} of ${testLeagues.length}`
        );
        teamsCreated++;
      } catch (error) {
        console.log(error);
      }
    }, 5000 * idx);
  });
};
