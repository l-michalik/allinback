import { exit } from "process";
import dbConnect from "../lib/dbConnect";
import { Fixture } from "../models/Fixtures";
import { formatDate, padStringWithSpaces } from "../utils";

export const runBacktest = async () => {
  console.log("Running backtest...");

  try {
    await dbConnect();

    const [start, end] = await Promise.all([
      Fixture.findOne({}).sort({ timestamp: 1 }),
      Fixture.findOne({}).sort({ timestamp: -1 }),
    ]);

    const fixtures = await Fixture.find({});

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

      console.log(
        `${padStringWithSpaces(fixturesDate, 25)} | (${
          fixturesForDate.length
        }) fixtures`
      );

      fixturesForDate.forEach((fixture) => {
        console.log(fixture);
      });

      startDate = nextDayDate;
      nextDayDate = new Date(nextDayDate.getTime() + 86400000);
    }
  } catch (error) {
    console.log("Error:", error);
  }

  console.log("Backtest completed.");
  exit();
};
