import dbConnect from "../../lib/dbConnect";
import { Prediction, PredictionStatus } from "../../models/Prediction";

export async function makeTest() {

  await dbConnect();

  const predictions = await Prediction.find({});

  console.log(`I run tests on ${predictions.length} samples`);

  predictions.sort((a, b) => a.timestamp - b.timestamp);

  const result = [];
  let currentStatus = null;
  let currentCount = 0;

  for (let i = 0; i < predictions.length; i++) {
    if (predictions[i].status !== currentStatus) {
      if (currentStatus !== null) result.push({ status: currentStatus, count: currentCount });

      currentStatus = predictions[i].status;
      currentCount = 1;
    } else {
      currentCount++;
    }
  }

  if (currentStatus !== null) {
    result.push({ status: currentStatus, count: currentCount });

    if (currentCount > 10 && currentStatus === PredictionStatus.FAILED) console.log('EMERGENCY: More than 10 FAILED consecutive predictions');
  }

  console.log(result);
}