// WORKS AS EXPECTED
import { ITeam, League, Team } from "../../models";
import dbConnect from "../../lib/dbConnect";
import { ModelIds } from "../../types";
import { createOptions, isArrayEmpty, preventRepeats } from "../../lib/utils";
import { supportedLigues } from "../../constants";
import axios from "axios";

export const createTeams = async (year: number) => {
  const activeLeaguesIds: any[] = [];

  try {
    await dbConnect();

    const leagues: ModelIds[] = await League.find({ id: { $in: supportedLigues } }).select('id name');

    activeLeaguesIds.push(...leagues)
  } catch (error) {
    console.log(error);
  }

  for (let i = 0; i < activeLeaguesIds.length; i++) {
    setTimeout(async () => {
      const ligue = activeLeaguesIds[i];

      const options = createOptions({
        params: {
          season: `${year}`,
          league: ligue.id
        },
        path: 'teams'
      })

      const documents: ITeam[] = [];

      try {
        const response = await axios.request(options);

        const data = response.data.response.map((doc: any) => {
          const team = doc.team;

          return {
            id: team.id,
            name: team.name,
            logo: team.logo,
            season: [year],
            league: ligue._id
          }
        })

        documents.push(...data);
      } catch (error) {
        console.log(error);
      }

      if (isArrayEmpty(documents)) return;

      const data = preventRepeats(documents, 'teams');

      try {
        await dbConnect();

        await Team.bulkWrite(data);

        console.log(`Teams for ${ligue.name} #[${ligue.id}] : ${year} created successfully! [${documents.length}]`);

      } catch (error) {
        console.log(error);
      }

    }, 10000 * i);
  }
}