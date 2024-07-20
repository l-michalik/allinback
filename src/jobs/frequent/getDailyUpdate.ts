import { ObjectId } from "mongoose";
import dbConnect from "../../lib/dbConnect";
import { getFormattedDate, getStartTimestamp } from "../../lib/utils";
import { IMatch, ITeam, ITeamForm, Match, Team, TeamForm } from "../../models";

// move where you want to helpers/services/modules or whatevr you called this dir/files
const BASE_GOAL_POINTS = [-0.5, 0.5, -1.5, 1.5, -2.5, 2.5, -3.5, 3.5, -4.5, 4.5];

const decoratePercentage = (percentage: number) => {
  if (percentage <= 25) return `\x1b[31m${percentage}%\x1b[0m`;
  if (percentage >= 75) return `\x1b[32m${percentage}%\x1b[0m`;
  return `${percentage}%`;
};

const displayStatistic = ({ statistic }: { statistic: GoalStatistic }) => {
  // -0.5 | 80% | 1.00 / +0.5 | 20% | 2.00
  // -1.5 | 80% | 2.00 / +0.5 | 20% | 2.00
  // -2.5 | 80% | 2.00 / +0.5 | 20% | 2.00
  // -3.5 | 80% | 2.00 / +0.5 | 20% | 2.00
  // -4.5 | 80% | 2.00 / +0.5 | 20% | 2.00
  let displayString = "";

  Object.entries(statistic).map(([goalPoint, result], index) => {
    if (index % 2 !== 0) displayString += " / ";
    else displayString += "\n";
    displayString += `${goalPoint} | ${decoratePercentage(+(result * 100).toFixed(2))} | 1.00`;
  });

  console.log(displayString);
};

enum TeamGoalType {
  SCORE = "SCORE",
  LOST = "LOST",
}
interface GetTeamGoalsParams {
  matches: IMatch[];
  teamId: ObjectId;
  type?: TeamGoalType;
}

const getTeamGoals = ({ matches, teamId, type = TeamGoalType.SCORE }: GetTeamGoalsParams) => {
  if (type === TeamGoalType.SCORE)
    return matches.map((match) => (match.teams.away === teamId ? match.goals.away : match.goals.home));
  else return matches.map((match) => (match.teams.away === teamId ? match.goals.home : match.goals.away));
};

interface GetLastTeamMatchesParams {
  teamDbId: number;
  teamId: ObjectId;
  toTimestamp: number;
}

const getLastTeamMatches = async ({ teamDbId, teamId, toTimestamp }: GetLastTeamMatchesParams) => {
  const lastFiveMatchesTeamA = await TeamForm.findOne<ITeamForm>({
    teamId: teamDbId,
  });

  let lastPlayedMatchesTeamA: IMatch[] = [];
  if (lastFiveMatchesTeamA) {
    lastPlayedMatchesTeamA = await Match.find<IMatch>({
      _id: {
        $in: lastFiveMatchesTeamA.lastFivePlayedMatches,
      },
    });
  } else {
    lastPlayedMatchesTeamA = await Match.find<IMatch>(
      {
        timestamp: {
          $lte: toTimestamp,
        },
        $or: [
          {
            teams: {
              home: teamId,
            },
          },
          {
            teams: {
              away: teamId,
            },
          },
        ],
      },
      {},
      {
        limit: 5,
        sort: {
          timestamp: -1,
        },
      }
    );

    console.log(
      `Can not find last teamA matches in TeamForm. Find ${lastPlayedMatchesTeamA.length} matches from Match collection`
    );
  }

  return lastPlayedMatchesTeamA;
};

interface PrepareGoalStatisticParams {
  temaAGoals: number[]; // [3, 4, 5]
  temaBGoals: number[]; // [2, 4, 1]
  goalPoints?: number[]; // [-1.5, -0.5, 0.5, 1.5]
}
type GoalStatistic = Record<string, number>;

const prepareGoalStatistic = ({
  temaAGoals,
  temaBGoals,
  goalPoints = BASE_GOAL_POINTS,
}: PrepareGoalStatisticParams) => {
  const allEntries = [...temaAGoals, ...temaBGoals].sort();
  const entriesLength = allEntries.length;

  const statistics: GoalStatistic = {};
  for (const goalPoint of goalPoints) {
    const matched = allEntries.filter((goals) => {
      return goalPoint < 0 ? goals < -goalPoint : goals > goalPoint;
    });

    statistics[goalPoint] = matched.length / entriesLength;
  }

  return statistics;
};

export const getDailyUpdate = async () => {
  let matches: IMatch[] = [];

  try {
    await dbConnect();

    const date = new Date();

    matches = await Match.find({
      timestamp: {
        $gte: getStartTimestamp(date, 0),
        $lt: getStartTimestamp(date, 1),
      },
    });

    if (matches.length === 0) {
      console.log(`Tomorrow, ${getFormattedDate(date)}, there are no matches scheduled\.`);

      // Telegram.sendMessage({
      //   message: `Tomorrow, ${getFormattedDate(tomorrow)}, there are no matches scheduled\\.`,
      // });

      const nearestMatch = await Match.find({ timestamp: { $gte: Math.floor(Date.now() / 1000) } })
        .sort({ timestamp: 1 })
        .limit(1);

      const nearestMatchDate = new Date(nearestMatch[0].date);

      console.log(`The next match is on ${getFormattedDate(nearestMatchDate)}\.`);

      // Telegram.sendMessage({
      //   message: `The next match is on ${getFormattedDate(date)}\\.`,
      // });
    }

    // TEST SCRIPT

    // get matches from the nearest date match
    const theNearestMatch = await Match.findOne<IMatch>(
      {
        timestamp: {
          $gte: getStartTimestamp(date, 0),
        },
      },
      {},
      {
        limit: 1,
        sort: {
          timestamp: 1,
        },
      }
    );

    // TODO handle
    if (!theNearestMatch) return;

    // TEST SCRIPT
    // view teama vs teamb at date

    // TEAM A
    const teamA = await Team.findOne<ITeam>({
      _id: theNearestMatch.teams.away,
    });

    // TODO handle
    if (!teamA) return;

    const lastMatchesTeamA = await getLastTeamMatches({
      teamDbId: teamA.id,
      teamId: teamA._id,
      toTimestamp: getStartTimestamp(date, 0),
    });

    // TEAM B
    const teamB = await Team.findOne<ITeam>({
      _id: theNearestMatch.teams.home,
    });

    // TODO handle
    if (!teamB) return;

    const lastMatchesTeamB = await getLastTeamMatches({
      teamDbId: teamB.id,
      teamId: teamB._id,
      toTimestamp: getStartTimestamp(date, 0),
    });

    // goals/goals-home/goaly-away last five matches
    /*
		-0.5 | 80% | 1.00 / +0.5 | 20% | 2.00
		-1.5 | 80% | 2.00 / +0.5 | 20% | 2.00
		-2.5 | 80% | 2.00 / +0.5 | 20% | 2.00
		-3.5 | 80% | 2.00 / +0.5 | 20% | 2.00
		-4.5 | 80% | 2.00 / +0.5 | 20% | 2.00
    */

    // goals
    const goalStatistic = prepareGoalStatistic({
      temaAGoals: getTeamGoals({
        matches: lastMatchesTeamA,
        teamId: teamA._id,
      }),
      temaBGoals: getTeamGoals({
        matches: lastMatchesTeamB,
        teamId: teamB._id,
      }),
      goalPoints: BASE_GOAL_POINTS,
    });
    // TODO remove, save in DB
    displayStatistic({
      statistic: goalStatistic,
    });

    // goals a shot miss
    const goalAShotMissStatistic = prepareGoalStatistic({
      temaAGoals: getTeamGoals({
        matches: lastMatchesTeamA,
        teamId: teamA._id,
      }),
      temaBGoals: getTeamGoals({
        matches: lastMatchesTeamB,
        teamId: teamB._id,
        type: TeamGoalType.LOST,
      }),
      goalPoints: BASE_GOAL_POINTS,
    });
    // TODO remove, save in DB
    displayStatistic({
      statistic: goalAShotMissStatistic,
    });

    // goals b miss shot
    const goalBShotMissStatistic = prepareGoalStatistic({
      temaAGoals: getTeamGoals({
        matches: lastMatchesTeamB,
        teamId: teamB._id,
      }),
      temaBGoals: getTeamGoals({
        matches: lastMatchesTeamA,
        teamId: teamA._id,
        type: TeamGoalType.LOST,
      }),
      goalPoints: BASE_GOAL_POINTS,
    });
    // TODO remove, save in DB
    displayStatistic({
      statistic: goalBShotMissStatistic,
    });
  } catch (error) {
    console.log(error);
  }
};
