import { createOptions, isArrayEmpty, preventRepeats } from "../../lib/utils";
import dbConnect from "../../lib/dbConnect";
import { IMatch, League, Match, Team } from "../../models";
import { ModelIds } from "../../types";
import axios from "axios";

export const createSeasonFixtures = async () => {
  // la liga/premier league/seria a/bundesliga/ligue one
  // 140/39/135/78/61

  const activeLeaguesIds: ModelIds[] = [];

  try {
    await dbConnect();

    // const leagues: ModelIds[] = await League.find({ id: { $in: [140, 39, 135, 78, 61] } }).select('id');
    const leagues: ModelIds[] = await League.find({ id: { $in: [140] } }).select('id');

    activeLeaguesIds.push(...leagues);
  } catch (error) {
    console.log(error);
  }

  const documentsPromises = activeLeaguesIds.map(async (item) => {

    const options = createOptions({
      path: "fixtures",
      params: {
        league: `${item.id}`,
        season: '2023',
        timezone: 'Europe/Warsaw'
      }
    })

    try {
      const response = await axios.request(options);

      return Promise.all(response.data.response.map(async (doc: any) => {
        const fixture = doc.fixture;
        const teams = doc.teams;

        const [_League, _Home, _Away] = await Promise.all([
          League.findOne({ id: item.id }).select('_id'),
          Team.findOne({ id: teams.home.id }).select('_id'),
          Team.findOne({ id: teams.away.id }).select('_id')
        ]);

        const ret = {
          id: fixture.id,
          date: fixture.date,
          league: _League,
          teams: {
            home: _Home,
            away: _Away
          }
        }

        console.log(ret);

        return ret;
      }));

    } catch (error) {
      console.error(error);
    }
  });

  const documents = await Promise.all(documentsPromises);

  if (isArrayEmpty(documents)) return;

  try {
    await dbConnect();

    await Match.insertMany(documents);

    console.log('SUCCESS!');

  } catch (error) {
    console.log(error);
  }
}