import { isArrayEmpty } from "../../lib/utils";
import dbConnect from "../../lib/dbConnect";
import { ITeam, Match, Team, TeamForm } from "../../models";

export const updateTeamForm = async () => {
  let teams: ITeam[] = [];

  try {
    await dbConnect();

    teams = await Team.find({}).select('id');
  } catch (error) {
    console.log(error);
  }

  const teamForms = await Promise.all(teams.map(async (team) => {
    const lastFivePlayedMatches = await Match.find({
      $and: [
        {
          $or: [
            { 'teams.home': team._id },
            { 'teams.away': team._id }
          ]
        },
        { timestamp: { $lt: Math.floor(Date.now() / 1000) } }
      ]
    })
      .sort({ timestamp: -1 })
      .limit(5)
      .select('_id');

    return {
      teamId: team.id,
      lastFivePlayedMatches: lastFivePlayedMatches.flatMap(match => match._id)
    };
  }));

  if (isArrayEmpty(teamForms)) return;

  try {
    await dbConnect();

    for (const teamForm of teamForms) {
      await TeamForm.findOneAndUpdate(
        { teamId: teamForm.teamId },
        {
          $set: {
            lastFivePlayedMatches: teamForm.lastFivePlayedMatches
          }
        },
        { upsert: true, new: true }
      );
    }

    console.log(`TeamForms updated successfully`);

  } catch (error) {
    console.error('Error updating TeamForms:', error);
  }
}