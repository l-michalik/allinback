import { ITeam, League, Team } from "../../models";
import dbConnect from "../../lib/dbConnect";
import { ModelIds } from "../../types";
import { createOptions, isArrayEmpty, preventRepeats } from "../../lib/utils";
import axios from "axios";

export const createTeams = async () => {
  const documents: ITeam[] = [];
  const activeLeaguesIds: ModelIds[] = [];

  try {
    await dbConnect();
    // la liga/premier league/seria a/bundesliga/ligue one
    // 140/39/135/78/61

    const leagues: ModelIds[] = await League.find({ id: { $in: [140, 39, 135, 78, 61] } }).select('id');

    activeLeaguesIds.push(...leagues)
  } catch (error) {
    console.log(error);
  }

  activeLeaguesIds.forEach(async (item) => {

    const options = createOptions({
      params: {
        season: '2024',
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
          season: [2024],
          league: item._id
        }
      })

      documents.push(...data);
    } catch (error) {
      console.log(error);
    }

    if (isArrayEmpty(documents)) return;

    const data = preventRepeats(documents);

    try {
      await dbConnect();

      await Team.bulkWrite(data);

    } catch (error) {
      console.log(error);
    }
  })
}