import mongoose, { Document, Schema } from "mongoose";

export enum PredictionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface IPrediction extends Document {
  fixtureId: number;
  name: string;
  betName: string;
  betValue: number;
  probability: number;
  timestamp: number;
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
  betName: {
    type: String,
    required: true,
  },
  betValue: {
    type: Number,
    required: true,
  },
  probability: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(PredictionStatus),
    default: PredictionStatus.PENDING,
  }
})

export const Prediction = mongoose.models.Prediction || mongoose.model<IPrediction>('Prediction', predictionSchema);