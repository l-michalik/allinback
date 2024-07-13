import { createOptions, isArrayEmpty, preventRepeats } from "../../lib/utils";
import dbConnect from "../../lib/dbConnect";
import { IMatch, League, Match, Team } from "../../models";
import { ModelIds } from "../../types";
import axios from "axios";

export const createSeasonFixtures = async (year: number) => {
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

  const documentsPromises = activeLeaguesIds.flatMap(async (item) => {
    const options = createOptions({
      path: "fixtures",
      params: {
        league: `${item.id}`,
        season: `${year}`,
        timezone: 'Europe/Warsaw'
      }
    });

    try {
      const response = await axios.request(options);

      return Promise.all(response.data.response.map(async (doc: any) => {
        const fixture = doc.fixture;
        const goals = doc.goals;
        const teams = doc.teams;

        const [_League, _Home, _Away] = await Promise.all([
          League.findOne({ id: item.id }).select('_id'),
          Team.findOne({ id: teams.home.id }).select('_id'),
          Team.findOne({ id: teams.away.id }).select('_id')
        ]);

        return {
          id: fixture.id,
          date: fixture.date,
          timestamp: fixture.timestamp,
          league: _League,
          teams: {
            home: _Home,
            away: _Away
          },
          goals: {
            home: goals.home,
            away: goals.away
          }
        };
      }));

    } catch (error) {
      console.error(error);
      return [];
    }
  });

  const documents = (await Promise.all(documentsPromises)).flat();

  if (isArrayEmpty(documents)) return;

  const data = preventRepeats(documents);

  try {
    await dbConnect();

    await Match.bulkWrite(data);

    console.log(`Season fixtures for year ${year} have been created!`);
  } catch (error) {
    console.log(error);
  }
}