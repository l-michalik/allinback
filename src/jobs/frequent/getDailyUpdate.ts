import { getFixturePrediction, getFormattedDate, getTeamGoals, getFormattedHour, getLastTeamMatches, getStartTimestamp, getStats } from "../../lib/utils";
import { fixtureName, fixtureValues } from "../../constants";
import { IMatch, Match } from "../../models";
import dbConnect from "../../lib/dbConnect";

export const getDailyUpdate = async () => {
  let matches: IMatch[] = [];

  try {
    await dbConnect();

    const date = new Date();

    matches = await Match
      .find({
        timestamp: {
          $gte: getStartTimestamp(date, 1),
          $lt: getStartTimestamp(date, 2),
        },
      })
      .sort({ timestamp: 1 })
      .populate("teams.home", "name id")
      .populate("teams.away", "name id")

    if (matches.length === 0) {
      console.log(`Tomorrow, ${getFormattedDate(date)}, there are no matches scheduled\.`);

      // Telegram.sendMessage({
      //   message: `Tomorrow, ${getFormattedDate(tomorrow)}, there are no matches scheduled\\.`,
      // });

      const nearestMatch = await Match.find({ timestamp: { $gte: Math.floor(Date.now() / 1000) } })
        .sort({ timestamp: 1 })
        .limit(1);

      const nearestMatchDate = new Date(nearestMatch[0].date);

      console.log(`The next match is on ${getFormattedDate(nearestMatchDate)}\.`);

      // Telegram.sendMessage({
      //   message: `The next match is on ${getFormattedDate(date)}\\.`,
      // });
    }

    for (const match of matches) {
      const teams = match.teams;

      const homeTeam: any = teams.home;
      const awayTeam: any = teams.away;

      const date = new Date(match.timestamp * 1000);

      console.log(`${homeTeam.name} vs ${awayTeam.name}, at ${getFormattedHour(date)}`);

      const lastMatchesHomeTeam = await getLastTeamMatches(homeTeam, date);
      const lastMatchesAwayTeam = await getLastTeamMatches(awayTeam, date);

      const homeTeamGoals = getTeamGoals(homeTeam.id, lastMatchesHomeTeam);
      const awayTeamGoals = getTeamGoals(awayTeam.id, lastMatchesAwayTeam);

      fixtureName.forEach((event: any, i: number) => {
        const stats = getStats(event, homeTeamGoals, awayTeamGoals);
        console.log(`${i + 1}. ${event} [Based on (${stats.length}) fixtures]:`);

        fixtureValues.forEach((value: any) => {
          console.log(getFixturePrediction(value, stats));
        });
      });
    }
  } catch (error) {
    console.log(error);
  }
};