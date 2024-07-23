import dbConnect from "../../lib/dbConnect";
import { Match } from "../../models";
import { Prediction, PredictionStatus } from "../../models/Prediction";

export const updatePredictions = async () => {
  try {
    await dbConnect();

    const predictions = await Prediction.find({ status: 'PENDING' });

    for (const prediction of predictions) {
      const match = await Match.findOne({ id: prediction.fixtureId });

      if (match.goals.home === null || match.goals.away === null) continue;

      const home = match.goals.home;
      const away = match.goals.away;
      const total = home + away;

      switch (prediction.name) {
        case 'Goals Over/Under':
          updatePredictionStatus(prediction, total, prediction.betValue);
          break;
        case 'Total - Home':
          updatePredictionStatus(prediction, home, prediction.betValue);
          break;
        case 'Total - Away':
          updatePredictionStatus(prediction, away, prediction.betValue);
          break;
      }
    }
    console.log('Predictions updated');


  } catch (error) {
    console.error(error);
  }
};

const updatePredictionStatus = async (prediction: any, value: any, betValue: any) => {
  const status = value < betValue ? PredictionStatus.SUCCESS : PredictionStatus.FAILED;
  await Prediction.updateOne({ _id: prediction._id }, { status });
};
