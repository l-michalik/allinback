import mongoose, { Document, Schema } from "mongoose";

enum PredictionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface IPrediction extends Document {
  fixtureId: number;
  name: string;
  value: string;
  devProbability: number;
  status: PredictionStatus;
}

const predictionSchema: Schema = new mongoose.Schema<IPrediction>({
  fixtureId: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  devProbability: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(PredictionStatus),
    default: PredictionStatus.PENDING,
  }
})

export const Prediction = mongoose.models.Prediction || mongoose.model<IPrediction>('Prediction', predictionSchema);