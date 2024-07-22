import { createOptions, isArrayEmpty, preventRepeats } from "../../lib/utils";
import { IMatch, League, Match, Team } from "../../models";
import { supportedLigues } from "../../constants";
import dbConnect from "../../lib/dbConnect";
import { ModelIds } from "../../types";
import axios from "axios";

export const updateSeasonFixtures = async (year: number) => {
  const activeLeaguesIds: any[] = [];

  try {
    await dbConnect();

    const leagues: ModelIds[] = await League.find({ id: { $in: supportedLigues } }).select('id name');

    activeLeaguesIds.push(...leagues);
  } catch (error) {
    console.log(error);
  }

  for (let i = 0; i < activeLeaguesIds.length; i++) {
    setTimeout(async () => {
      const ligue = activeLeaguesIds[i];

      const options = createOptions({
        path: "fixtures",
        params: {
          league: `${ligue.id}`,
          season: `${year}`,
          timezone: 'Europe/Warsaw'
        }
      });


      try {
        const response = await axios.request(options);

        const documentsPromises = Promise.all(response.data.response.map(async (doc: any) => {
          const fixture = doc.fixture;
          const goals = doc.goals;
          const teams = doc.teams;

          const [_League, _Home, _Away] = await Promise.all([
            League.findOne({ id: ligue.id }).select('_id'),
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

        const documents = (await documentsPromises).flat();

        if (isArrayEmpty(documents)) return;

        const data = preventRepeats(documents);

        await dbConnect();

        await Match.bulkWrite(data);

        console.log(`Season fixtures for ${ligue.name} #[${ligue.id}] : ${year} created successfully! [${documents.length}]`);

      } catch (error) {
        console.log(error);
      }

    }, 10000 * i);
  }
}