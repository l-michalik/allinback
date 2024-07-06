import { createOptions, isArrayEmpty, preventRepeats } from "../../lib/utils";
import dbConnect from "../../lib/dbConnect";
import { IMatch, League, Match, Team } from "../../models";
import { ModelIds } from "../../types";
import axios from "axios";

export const createSeasonFixtures = async () => {
  // la liga/premier league/seria a/bundesliga/ligue one
  // 140/39/71/78/61

  const documents: IMatch[] = [];
  const activeLeaguesIds: ModelIds[] = [];

  try {
    await dbConnect();

    const leagues: ModelIds[] = await League.find({ id: { $in: [140, 39, 71, 78, 61] } }).select('id');

    activeLeaguesIds.push(...leagues);
  } catch (error) {
    console.log(error);
  }

  activeLeaguesIds.forEach(async (item) => {

    const options = createOptions({
      path: "fixtures",
      params: {
        league: `${item.id}`,
        season: '2024',
        timezone: 'Europe/Warsaw'
      }
    })

    try {
      const response = await axios.request(options);

      const data = await Promise.all(response.data.response.map(async (doc: any) => {
        const fixture = doc.fixture;
        const teams = doc.teams;
        const _League = await League.findOne({ id: item.id }).select('_id');
        const _Home = await Team.findOne({ id: teams.home.id }).select('_id');
        const _Away = await Team.findOne({ id: teams.away.id }).select('_id');

        return {
          id: fixture.id,
          date: fixture.date,
          league: _League,
          teams: {
            home: _Home,
            away: _Away
          }
        };
      }));

      documents.push(...data);
    } catch (error) {
      console.error(error);
    }

    console.log(documents);

    if (isArrayEmpty(documents)) return;

    const data = preventRepeats(documents);

    try {
      await dbConnect();

      await Match.bulkWrite(data);

      console.log('SUCCESS!');

    } catch (error) {
      console.log(error);
    }
  })
}