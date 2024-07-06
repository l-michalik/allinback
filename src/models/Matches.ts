import mongoose, { Document, Schema } from "mongoose";

export interface IMatch extends Document {
  id: number;
  date: string;
  league: Schema.Types.ObjectId;
  teams: {
    home: Schema.Types.ObjectId;
    away: Schema.Types.ObjectId;
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
  }
})

export const Match = mongoose.models.Match || mongoose.model<IMatch>('Match', matchSchema);