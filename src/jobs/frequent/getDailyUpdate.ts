
import { getFormattedDate, getStartTimestamp } from "../../lib/utils";
import { Telegram } from "../../lib/telegram";
import dbConnect from "../../lib/dbConnect";
import { ITeam, Match } from "../../models";

export const getDailyUpdate = async () => {

  let matches: ITeam[] = [];

  try {
    await dbConnect();

    const date = new Date();

    matches = await Match.find({
      timestamp: {
        $gte: getStartTimestamp(date, 0),
        $lt: getStartTimestamp(date, 1)
      }
    });

    if (matches.length === 0) {

      console.log(`Tomorrow, ${getFormattedDate(date)}, there are no matches scheduled\.`);

      // Telegram.sendMessage({
      //   message: `Tomorrow, ${getFormattedDate(tomorrow)}, there are no matches scheduled\\.`,
      // });

      const nearestMatch = await Match.find({ timestamp: { $gte: Math.floor(Date.now() / 1000) } })
        .sort({ timestamp: 1 })
        .limit(1);

      const nearestMatchDate = new Date(nearestMatch[0].date);

      console.log(`The next match is on ${getFormattedDate(nearestMatchDate)}\.`,);

      // Telegram.sendMessage({
      //   message: `The next match is on ${getFormattedDate(date)}\\.`,
      // });
    }

    // TEST SCRIPT

    // get matches from the nearest date match one for now ()
    // matches = await Match.find({
    //   timestamp: {
    //     $gte: getStartTimestamp(0),
    //     $lt: getStartTimestamp(1)
    //   }
    // });

    // TEST SCRIPT

    // get matches from the nearest date match one for now ()
    // view teama vs teamb at date (telegram info)
    // send predictions for last 5 matches under, over, archaic buk odd

    console.log('s');

  } catch (error) {
    console.log(error);
  }
}