// WORKS AS EXPECTED
import { ITeam, League, Team } from "../../models";
import dbConnect from "../../lib/dbConnect";
import { ModelIds } from "../../types";
import { createOptions, isArrayEmpty, preventRepeats } from "../../lib/utils";
import axios from "axios";

export const createTeams = async (year: number) => {
  const documents: ITeam[] = [];
  const activeLeaguesIds: ModelIds[] = [];

  try {
    await dbConnect();

    const leagues: ModelIds[] = await League.find({ id: { $in: [140] } }).select('id');

    activeLeaguesIds.push(...leagues)
  } catch (error) {
    console.log(error);
  }

  activeLeaguesIds.forEach(async (item) => {

    const options = createOptions({
      params: {
        season: `${year}`,
        league: item.id
      },
      path: 'teams'
    })

    try {
      const response = await axios.request(options);

      const data = response.data.response.map((doc: any) => {
        const team = doc.team;

        return {
          id: team.id,
          name: team.name,
          logo: team.logo,
          season: [year],
          league: item._id
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

      console.log(`Teams for year ${year} created successfully!`);

    } catch (error) {
      console.log(error);
    }
  })
}