import mongoose, { Document, Number, Schema } from "mongoose";

export interface ITeamForm extends Document {
  teamId: number;
  lastFivePlayedMatches: Array<Schema.Types.ObjectId>
}

const teamFormSchema: Schema = new mongoose.Schema<ITeamForm>({
  teamId: {
    type: Number,
    required: true,
  },
  lastFivePlayedMatches: {
    type: [Schema.Types.ObjectId],
    ref: 'Match',
    required: true,
  }
})

export const TeamForm = mongoose.models.TeamForm || mongoose.model<ITeamForm>('TeamForm', teamFormSchema);