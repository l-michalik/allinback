import mongoose, { Schema } from "mongoose";

export interface IStats {
  id: number;
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
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
      required: true,
    },
    away: {
      type: Number,
      required: true,
    },
  },
  score: {
    halftime: {
      home: {
        type: Number,
        required: true,
      },
      away: {
        type: Number,
        required: true,
      },
    },
  },
})

export const Statistic = mongoose.models.Statistic || mongoose.model<IStats>('Statistic', statisticSchema);