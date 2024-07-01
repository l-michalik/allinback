import mongoose, { Document, Schema } from "mongoose";

export interface ILeague extends Document {
  id: number;
  name: string;
  logo: string;
  active: boolean;
}

const leagueSchema: Schema = new mongoose.Schema<ILeague>({
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
  active: {
    type: Boolean,
    default: false,
  }
})

const League = mongoose.models.League || mongoose.model<ILeague>('League', leagueSchema);

export default League;