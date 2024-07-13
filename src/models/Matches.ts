import mongoose, { Document, Schema } from "mongoose";

export interface IMatch extends Document {
  id: number;
  date: string;
  timestamp: number;
  league: Schema.Types.ObjectId;
  teams: {
    home: Schema.Types.ObjectId;
    away: Schema.Types.ObjectId;
  }
  goals: {
    home: number;
    away: number;
  }
}

const matchSchema: Schema = new mongoose.Schema<IMatch>({
  id: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true
  },
  timestamp: {
    type: Number,
    required: true
  },
  league: {
    type: Schema.Types.ObjectId,
    ref: 'League',
    required: true,
  },
  teams: {
    home: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    away: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    }
  },
  goals: {
    home: {
      type: Number,
      required: true,
    },
    away: {
      type: Number,
      required: true,
    }
  }
})

export const Match = mongoose.models.Match || mongoose.model<IMatch>('Match', matchSchema);