import mongoose, { Schema } from "mongoose";

export interface IStats {
  id: number;
  goals: {
    home: number;
    away: number;
  };
  score: {
    halftime: {
      home: number;
      away: number;
    };
  }
}

const statisticSchema: Schema = new mongoose.Schema<IStats>({
  id: {
    type: Number,
    required: true,
  },
  goals:{
    home: {
      type: Number,
    },
    away: {
      type: Number,
    },
  },
  score: {
    halftime: {
      home: {
        type: Number,
      },
      away: {
        type: Number,
      },
    },
  },
})

export const Statistic = mongoose.models.Statistic || mongoose.model<IStats>('Statistic', statisticSchema);