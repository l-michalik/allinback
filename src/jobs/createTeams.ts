import { createOptions, insertOrUpdateTeams, isArrayEmpty } from "../utils";
import { supportedLigues } from "../constants";
import { League } from "../models/Leagues";
import dbConnect from "../lib/dbConnect";

const axios = require("axios");

export const createTeams = async (year: number) => {
  let documents: any[] = [];
  const leaguesModels = [];
  let teamsCreated = 1;

  try {
    await dbConnect();

    const leagues = await League.find({
      id: { $in: supportedLigues },
    }).select("id name");

    leaguesModels.push(...leagues);
  } catch (error) {
    console.log(error);
  }

  leaguesModels.forEach((ligue, idx) => {
    setTimeout(async () => {
      const options = createOptions({
        params: {
          season: `${year}`,
          league: ligue.id,
        },
        path: "teams",
      });

      documents = [];

      try {
        const response = await axios.request(options);

        const data = response.data.response.map((doc: any) => {
          const team = doc.team;

          return {
            id: team.id,
            name: team.name,
            season: [year],
            league: ligue._id
          }
        })

        documents.push(...data);
      } catch (error) {
        console.log(error);
      }

      if (isArrayEmpty(documents)) return;

      try {
        await dbConnect();

        insertOrUpdateTeams(documents);
        
        console.log(`Teams for ${ligue.name} : ${year} created successfully! [${documents.length}] | ${teamsCreated} of ${supportedLigues.length}`);
        
        teamsCreated++;
      } catch (error) {
        console.log(error);
      }
    }, 5000 * idx);
  });
};
