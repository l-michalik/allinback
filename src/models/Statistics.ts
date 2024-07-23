import mongoose, { Document, ObjectId, Schema } from "mongoose";

export interface ITeamStatistics {
  teamId: number;
  shotsOnGoal: number;
  shotsOffGoal: number;
  totalShots: number;
  blockedShots: number;
  shotsInsideBox: number;
  shotsOutsideBox: number;
  fouls: number;
  cornerKicks: number;
  offsides: number;
  ballPossession: number;
  yellowCards: number;
  redCards: number;
  goalkeeperSaves: number;
  totalPasses: number;
  accuratePasses: number;
  score: {
    halftime: number;
    fulltime: number;
    extratime: number;
    penalty: number;
    total: number;
  }
}

export interface IStatistics extends Required<Document<ObjectId>> {
  fixtureId: number;
  home: ITeamStatistics;
  away: ITeamStatistics;
}

const statisticsSchema: Schema = new mongoose.Schema<IStatistics>({
  fixtureId: {
    type: Number,
    required: true,
  },
  home: {
    type: mongoose.Schema<ITeamStatistics>,
    required: true,
  },
  away: {
    type: mongoose.Schema<ITeamStatistics>,
    required: true,
  }
})

export const Statistics = mongoose.models.Statistics || mongoose.model<IStatistics>('Statistics', statisticsSchema);