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
import { formatDate, groupByFixtureId, padStringWithSpaces } from "../utils";
import { EventTypes, EventTypesEnum } from "../constants";
import dbConnect from "../lib/dbConnect";
import { Fixture } from "../models";
import { exit } from "process";
import { EventStatusEnum, ILikelyType } from "../types";

export const runBacktest = async () => {
  console.log("Running backtest...");

  const likelyTypes: ILikelyType[] = [];
  let fixtures: any[] = [];

  try {
    await dbConnect();

    const [start, end] = await Promise.all([
      Fixture.findOne({}).sort({ timestamp: 1 }),
      Fixture.findOne({}).sort({ timestamp: -1 }),
    ]);

    fixtures = await Fixture.find({})
      .populate(["statistic", "league", "teams.home", "teams.away"])
      .sort({ timestamp: -1 })
      .limit(50);

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
        `${padStringWithSpaces(fixturesDate, 27)} | (${fixturesForDate.length
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
              likelyTypes.push(...calculateDoubleChancePercentages(
                fixture.id,
                analyzedFixtures,
                homeTeam,
                awayTeam
              ));
              break;
            case EventTypesEnum["Gole Powyżej/Poniżej"]:
              likelyTypes.push(...calculateOverUnderPercentages(
                fixture.id,
                analyzedFixtures
              ));
              break;
            case EventTypesEnum["Oba zespoły strzelą gola"]:
              likelyTypes.push(...calculateBTTSPercentages(
                fixture.id,
                analyzedFixtures
              ));
              break;
            case EventTypesEnum["Gole gospodarzy powyżej/poniżej"]:
              likelyTypes.push(...calculateTeamOverUnderPercentages(
                fixture.id,
                EventTypesEnum["Gole gospodarzy powyżej/poniżej"],
                analyzedFixtures,
                fixture.teams.home.id
              ));
              break;
            case EventTypesEnum["Gole gości powyżej/poniżej"]:
              likelyTypes.push(...calculateTeamOverUnderPercentages(
                fixture.id,
                EventTypesEnum["Gole gości powyżej/poniżej"],
                analyzedFixtures,
                fixture.teams.away.id
              ));
              break;
            case EventTypesEnum["Handicap"]:
              likelyTypes.push(...calculateHandicapPercentages(
                fixture.id,
                analyzedFixtures,
                homeTeam,
                awayTeam
              ));
              break;
            case EventTypesEnum["Wynik 1. połowy"]:
              likelyTypes.push(...calculateFirstHalfResultPercentages(
                fixture.id,
                analyzedFixtures,
                homeTeam,
                awayTeam
              ));
              break;
            case EventTypesEnum["1. połowa, gole powyżej/poniżej"]:
              likelyTypes.push(...calculateFirstHalfOverUnderPercentages(
                fixture.id,
                analyzedFixtures
              ));
              break;
          }
        });
      });
    }

  } catch (error) {
    console.log("Error:", error);
  }

  if (likelyTypes.length === 0) {
    console.log("No likely types found.");
    console.log("Backtest completed.");
    exit();
  }

  console.log(`Likely types: ${likelyTypes.length}`);

  const likelyTypesGrouped = groupByFixtureId(likelyTypes);

  Object.keys(likelyTypesGrouped).forEach((fixtureId: any) => {
    console.log(`- Fixture ID: ${fixtureId}`);

    const fixtureToCheck = fixtures.find((f) => f.id === parseInt(fixtureId));

    const score = fixtureToCheck.statistic.score;
    const goals = fixtureToCheck.statistic.goals;
    let [uo, value]: any = [];
    let w1, w2, w3, w4;

    likelyTypesGrouped[fixtureId].forEach((item) => {
      switch (item.type) {
        case EventTypesEnum['1. połowa, gole powyżej/poniżej']:
          const htGoals = score.halftime.home + score.halftime.away;

          [uo, value] = item.name.split(' ');

          if (uo === 'Powyżej' && htGoals > parseFloat(value) || uo === 'Poniżej' && htGoals < parseFloat(value)) {
            item.status = EventStatusEnum.SUCCESS;
          } else {
            item.status = EventStatusEnum.FAILED
          }

          break;
        case EventTypesEnum['Wynik meczu (z wyłączeniem dogrywki)']:
          if ((item.name === 'Remis' && goals.home === goals.away)
            || (item.name === fixtureToCheck.teams.home.name && goals.home > goals.away)
            || (item.name === fixtureToCheck.teams.away.name && goals.away > goals.home)) {
            item.status = EventStatusEnum.SUCCESS
          } else {
            item.status = EventStatusEnum.FAILED
          }

          break;
        case EventTypesEnum['Wynik 1. połowy']:
          if ((item.name === 'Remis' && score.halftime.home === score.halftime.away)
            || (item.name === fixtureToCheck.teams.home.name && score.halftime.home > score.halftime.away)
            || (item.name === fixtureToCheck.teams.away.name && score.halftime.away > score.halftime.home)
          ) {
            item.status = EventStatusEnum.SUCCESS
          } else {
            item.status = EventStatusEnum.FAILED
          }

          break;
        case EventTypesEnum['Podwójna szansa']:
          w1 = !item.name.includes('Remis') && goals.home !== goals.away;
          w2 = item.name.includes(`${fixtureToCheck.teams.home.name} lub Remis`) && goals.home >= goals.away;
          w3 = item.name.includes(`${fixtureToCheck.teams.away.name} lub Remis`) && goals.away >= goals.home;

          if ((w1) || (w2) || (w3)) {
            item.status = EventStatusEnum.SUCCESS
          } else {
            item.status = EventStatusEnum.FAILED
          }

          break;
        case EventTypesEnum['Gole Powyżej/Poniżej']:
          const ftGoals = goals.home + goals.away;

          [uo, value] = item.name.split(' ');

          if (uo === 'Powyżej' && ftGoals > parseFloat(value) || uo === 'Poniżej' && ftGoals < parseFloat(value)) {
            item.status = EventStatusEnum.SUCCESS;
          } else {
            item.status = EventStatusEnum.FAILED
          }
          break;
        case EventTypesEnum['Oba zespoły strzelą gola']:
          w1 = item.name === 'Tak' && goals.home > 0 && goals.away > 0;
          w2 = item.name === 'Nie' && (goals.home === 0 || goals.away === 0);

          if (w1 || w2) {
            item.status = EventStatusEnum.SUCCESS;
          } else {
            item.status = EventStatusEnum.FAILED;
          }

          break;
        case EventTypesEnum['Gole gospodarzy powyżej/poniżej']:
          const homeGoals = goals.home;

          [uo, value] = item.name.split(' ');

          if (uo === 'Powyżej' && homeGoals > parseFloat(value) || uo === 'Poniżej' && homeGoals < parseFloat(value)) {
            item.status = EventStatusEnum.SUCCESS;
          } else {
            item.status = EventStatusEnum.FAILED
          }

          break;
        case EventTypesEnum['Gole gości powyżej/poniżej']:
          const awayGoals = goals.away;

          [uo, value] = item.name.split(' ');

          if (uo === 'Powyżej' && awayGoals > parseFloat(value) || uo === 'Poniżej' && awayGoals < parseFloat(value)) {
            item.status = EventStatusEnum.SUCCESS;
          } else {
            item.status = EventStatusEnum.FAILED
          }

          break;
        case EventTypesEnum['Handicap']:
          const lastSpaceIndex = item.name.lastIndexOf(' ');

          const team = item.name.substring(0, lastSpaceIndex);
          const handicap = item.name.substring(lastSpaceIndex + 1);

          const isMinus = handicap.includes('-');
          value = parseFloat(handicap.replace('-', ''));

          w1 = fixtureToCheck.teams.home.name === team && isMinus && goals.home - value > goals.away;
          w2 = fixtureToCheck.teams.away.name === team && isMinus && goals.away - value > goals.home;
          w3 = fixtureToCheck.teams.home.name === team && !isMinus && goals.home + value > goals.away;
          w4 = fixtureToCheck.teams.away.name === team && !isMinus && goals.away + value > goals.home;

          if (w1 || w2 || w3 || w4) {
            item.status = EventStatusEnum.SUCCESS;
          } else {
            item.status = EventStatusEnum.FAILED;
          }

          break;
        default:
          console.log('UNHANDLED TYPE');
          console.log(item);
          break;
      }
    });
  });

  console.log('### SUMMARY ###');
  console.log(`PENDING: ${likelyTypes.filter((lt) => lt.status === 'PENDING').length}`);
  console.log(`SUCCESS: ${likelyTypes.filter((lt) => lt.status === 'SUCCESS').length}`);
  console.log(`FAILED: ${likelyTypes.filter((lt) => lt.status === 'FAILED').length}`);
  console.log(`SUCCESS RATE: ${((likelyTypes.filter((lt) => lt.status === 'SUCCESS').length / likelyTypes.length) * 100).toFixed(2)}%`);
  
  console.log("Backtest completed.");
  exit();
};
