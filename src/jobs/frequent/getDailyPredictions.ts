
import dbConnect from "../../lib/dbConnect";
import { createOptions, getNextDay } from "../../lib/utils";
import axios from "axios";
import { ModelIds } from "../../types";
import { League } from "./../../models";

export async function getDailyPredictions() {
  const activeLeaguesIds: ModelIds[] = [];

  try {
    await dbConnect();

    const leagues: ModelIds[] = await League.find({ id: { $in: [106] } }).select('id');

    activeLeaguesIds.push(...leagues)
  } catch (error) {
    console.log(error);
  }

  activeLeaguesIds.forEach(async (item) => {

    const options = createOptions({
      params: {
        league: item.id,
        season: new Date().getFullYear(),
        date: getNextDay(),
        timezone: 'Europe/Warsaw'
      },
      path: 'odds'
    })

    try {
      const response = await axios.request(options);

      response.data.response.forEach((doc: any) => {

        doc.bookmakers.forEach((bookmaker: any) => {
          if (bookmaker.id !== 8) return;

          // 'GOALS Over/Under' | 'Total - Home' | 'Total - Away'

          // CHECK CONDITIONS

          // 1.
          // IF(PREDICTION IS OVER 75%, BUT RATE IS BELOW 1.42) - SEND MESSAGE WITH HESITATION

          // 2.
          // IF(PREDICTION IS UNDER 75% AND RATE IS OVER 1.42) - SEND TELEGRAM MESSAGE
          // AND ALSO PREDICTION MODEL SHOULD BE CREATED

          // 3.
          // IF(PREDICTION IS UNDER 75% AND RATE IS UNDER 1.42) - RETURN

          console.log(bookmaker);
        });
      });

    } catch (error) {
      console.log(error);
    }
  });
}
