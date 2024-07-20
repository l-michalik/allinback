import mongoose, { Document, Number, ObjectId, Schema } from "mongoose";

export interface ITeam extends Required<Document<ObjectId>> {
  id: number;
  name: string;
  logo: string;
  season: Array<Number>
  league: Schema.Types.ObjectId;
}

const teamSchema: Schema = new mongoose.Schema<ITeam>({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  season: {
    type: [Number],
    required: true,
  },
  league: {
    type: Schema.Types.ObjectId,
    ref: 'League',
    required: true,
  }
})

export const Team = mongoose.models.Team || mongoose.model<ITeam>('Team', teamSchema);