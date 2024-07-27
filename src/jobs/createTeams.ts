import { createOptions, isArrayEmpty } from "../utils";
import { supportedLiguesTopFive } from "../constants";
import { League } from "../models/Leagues";
import dbConnect from "../lib/dbConnect";
import { Team } from "../models/Teams";

const axios = require("axios");

export const createTeams = async (year: number) => {
  let documents: any[] = [];
  const leaguesModels = [];

  try {
    await dbConnect();

    const leagues = await League.find({
      id: { $in: supportedLiguesTopFive },
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

        await Team.insertMany(documents);

        console.log(`Teams for ${ligue.name} : ${year} created successfully! [${documents.length}]`);
        
      } catch (error) {
        console.log(error);
      }
    }, 5000 * idx);
  });
};
