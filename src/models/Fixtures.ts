import mongoose, { Document, Schema } from "mongoose";

export interface IFixture extends Document {
  id: number;
  timestamp: number;
  league: Schema.Types.ObjectId;
  statistic: Schema.Types.ObjectId | null;
  teams: {
    home: Schema.Types.ObjectId;
    away: Schema.Types.ObjectId;
  };
}

const fixtureSchema: Schema = new mongoose.Schema<IFixture>({
  id: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  league: {
    type: Schema.Types.ObjectId,
    ref: "League",
    required: true,
  },
  statistic: {
    type: Schema.Types.ObjectId,
    ref: "Statistic",
    required: true,
  },
  teams: {
    home: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    away: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
  },
});

export const Fixture = mongoose.models.Fixture || mongoose.model<IFixture>("Fixture", fixtureSchema);
