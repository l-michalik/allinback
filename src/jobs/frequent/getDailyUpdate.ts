import { Telegram } from "../../lib/telegram";
import dbConnect from "../../lib/dbConnect";
import { ITeam, Match } from "../../models";
import { getTomorrowStartTimestamp, getDayAfterTomorrowStartTimestamp, getFormattedDate } from "../../lib/utils";

export const getDailyUpdate = async () => {

  let matches: ITeam[] = [];

  try {
    await dbConnect();

    matches = await Match.find({
      timestamp: {
        $gte: getTomorrowStartTimestamp(),
        $lt: getDayAfterTomorrowStartTimestamp()
      }
    });

    if (matches.length === 0) {
      // Telegram.sendMessage({
      //   message: `Tomorrow, ${getFormattedDate()}, there are no matches scheduled\\.`,
      // });

      const nearestTimestamp = await Match.find({ timestamp: { $gte: Math.floor(Date.now() / 1000) } })
        .sort({ timestamp: 1 })
        .limit(1)
        .select('timestamp');

      console.log(nearestTimestamp);
    }
  } catch (error) {
    console.log(error);
  }
}