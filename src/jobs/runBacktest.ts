import {
  calculateTeamOverUnderPercentages,
  calculateBTTSPercentages,
  calculateDoubleChancePercentages,
  calculateMatchResultPercentages,
  calculateOverUnderPercentages,
  calculateFirstHalfOverUnderPercentages,
  calculateFirstHalfResultPercentages,
  calculateHandicapPercentages,
} from "../utils/calculation";
import { formatDate, padStringWithSpaces } from "../utils";
import { EventTypes, EventTypesEnum } from "../constants";
import dbConnect from "../lib/dbConnect";
import { Fixture } from "../models";
import { exit } from "process";
import { ILikelyType } from "../types";

export const runBacktest = async () => {
  console.log("Running backtest...");

  try {
    await dbConnect();

    const [start, end] = await Promise.all([
      Fixture.findOne({}).sort({ timestamp: 1 }),
      Fixture.findOne({}).sort({ timestamp: -1 }),
    ]);

    const fixtures = await Fixture.find({})
      .populate(["statistic", "league", "teams.home", "teams.away"])
      .sort({ timestamp: -1 })
      .limit(50);

    const likelyTypes: ILikelyType[] = [];

    let startDate: any = new Date(start.timestamp * 1000);
    startDate.setHours(0, 0, 0, 0);

    let nextDayDate: any = new Date(start.timestamp * 1000 + 86400000);
    nextDayDate.setHours(0, 0, 0, 0);

    let endDate: any = new Date(end.timestamp * 1000 + 86400000);
    endDate.setHours(0, 0, 0, 0);

    while (nextDayDate <= endDate) {
      const fixturesDate = formatDate(startDate);

      const fixturesForDate = fixtures.filter(
        (fixture) =>
          fixture.timestamp >= startDate.getTime() / 1000 &&
          fixture.timestamp < nextDayDate.getTime() / 1000
      );

      startDate = nextDayDate;
      nextDayDate = new Date(nextDayDate.getTime() + 86400000);

      if (fixturesForDate.length === 0) {
        continue;
      }

      console.log(
        `${padStringWithSpaces(fixturesDate, 27)} | (${
          fixturesForDate.length
        }) fixtures`
      );

      fixturesForDate.forEach(async (fixture) => {
        console.log(
          `- ${padStringWithSpaces(
            fixture.league.name,
            25
          )} | ${padStringWithSpaces(
            `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
            45
          )} | ${new Date(fixture.timestamp * 1000).toLocaleString()}`
        );

        const analyzedFixtures = fixtures
          .filter(
            (f) =>
              (f.teams.home._id === fixture.teams.home._id ||
                f.teams.away._id === fixture.teams.home._id ||
                f.teams.home._id === fixture.teams.away._id ||
                f.teams.away._id === fixture.teams.away._id) &&
              f.timestamp < fixture.timestamp
          )
          .slice(-1);

        console.log("-- Available fixtures:", analyzedFixtures.length);

        if (analyzedFixtures.length === 0) {
          console.log("-- No fixtures to analyze. Skipping...");
          return;
        }

        const homeTeam = fixture.teams.home.name;
        const awayTeam = fixture.teams.away.name;

        EventTypes.forEach((eventType, idx) => {
          console.log(`--- (${idx + 1}). ${eventType}`);

          switch (eventType) {
            case EventTypesEnum["Wynik meczu (z wyłączeniem dogrywki)"]:
              likelyTypes.push(...calculateMatchResultPercentages(
                fixture.id,
                analyzedFixtures,
                homeTeam,
                awayTeam
              ));
              break;
            case EventTypesEnum["Podwójna szansa"]:
              // likelyTypes.push(...calculateDoubleChancePercentages(
              //   fixture.id,
              //   analyzedFixtures,
              //   homeTeam,
              //   awayTeam
              // ));
              break;
            case EventTypesEnum["Gole Powyżej/Poniżej"]:
              // likelyTypes.push(...calculateOverUnderPercentages(
              //   fixture.id,
              //   analyzedFixtures
              // ));
              break;
            case EventTypesEnum["Oba zespoły strzelą gola"]:
              // calculateBTTSPercentages(analyzedFixtures);
              break;
            case EventTypesEnum["Gole gospodarzy powyżej/poniżej"]:
              // calculateTeamOverUnderPercentages(
              //   analyzedFixtures,
              //   fixture.teams.home.id
              // );
              break;
            case EventTypesEnum["Gole gości powyżej/poniżej"]:
              // calculateTeamOverUnderPercentages(
              //   analyzedFixtures,
              //   fixture.teams.away.id
              // );
              break;
            case EventTypesEnum["Handicap"]:
              // calculateHandicapPercentages(
              //   analyzedFixtures,
              //   homeTeam,
              //   awayTeam
              // );
              break;
            case EventTypesEnum["Wynik 1. połowy"]:
              // calculateFirstHalfResultPercentages(
              //   analyzedFixtures,
              //   homeTeam,
              //   awayTeam
              // );
              break;
            case EventTypesEnum["1. połowa, gole powyżej/poniżej"]:
              // calculateFirstHalfOverUnderPercentages(analyzedFixtures);
              break;
          }
        });
      });
    }

    console.log("###########################################");

    if (likelyTypes.length === 0) {
      console.log("No likely types found.");
    } else {
      console.log(`Likely types: ${likelyTypes.length}`);
    }
  } catch (error) {
    console.log("Error:", error);
  }

  console.log("Backtest completed.");
  exit();
};
