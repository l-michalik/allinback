import { IMatch, ITeam, Match } from "../models";
import { IOptions } from "../types";

export const isArrayEmpty = (arr: any[]) => {
  return !Array.isArray(arr) || arr.length === 0
};

export const preventRepeats = (arr: any[], model?: string) => {
  return arr.map((doc: any) => ({
    updateOne: {
      filter: { id: doc.id },
      update: model === 'teams' ? {
        $set: {
          name: doc.name,
          logo: doc.logo,
          league: doc.league
        },
        // check if workds properly on double season 
        $addToSet: { season: { $each: doc.season } }
      } : { $set: doc },
      upsert: true
    }
  }));
};

export const createOptions = ({ params, path }: IOptions) => {
  return {
    method: 'GET',
    url: `https://api-football-v1.p.rapidapi.com/v3/${path}`,
    params: params,
    headers: {
      'x-rapidapi-key': process.env.RAPID_API_KEY,
      'x-rapidapi-host': process.env.RAPID_API_HOST
    }
  }
}

export function getStartTimestamp(date: Date, daysFromNow: number,): number {
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(0, 0, 0, 0);
  return Math.floor(date.getTime() / 1000);
}

export function getFormattedDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getFormattedHour(date: Date): string {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${weekday}, ${hours}:${minutes}`;
}

export function getNextDay() {
  const today = new Date();

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export async function getLastTeamMatches(team: ITeam, date: Date) {
  const oneMonthAgo = new Date(date);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 6); //  change to 1

  return Match.find({
    $or: [
      { "teams.home": team },
      { "teams.away": team },
    ],
    timestamp: {
      $gte: oneMonthAgo.getTime() / 1000,
      $lt: date.getTime() / 1000,
    }
  })
    .limit(5)
    .sort({ timestamp: -1 })
    .populate("teams.home", "name id")
    .populate("teams.away", "name id");
}

export function getFixturePrediction(fixtureValues: number[], stats: number[]) {
  const underEvents = fixtureValues.map(value => ({
    value: value,
    probability: ((stats.filter(stat => stat < value).length / stats.length) * 100)
  }));

  const overEvents = fixtureValues.map(value => ({
    value: value,
    probability: ((stats.filter(stat => stat > value).length / stats.length) * 100)
  }));

  return {
    under: underEvents,
    over: overEvents
  };
}

export function getTeamGoals(teamId: number, matches: any) {
  let scored: number[] = [], conceded: number[] = [];

  matches.map((match: any) => {
    if (match.teams.home.id === teamId) {
      scored.push(match.goals.home);
      conceded.push(match.goals.away);
    } else if (match.teams.away.id === teamId) {
      scored.push(match.goals.away);
      conceded.push(match.goals.home);
    }
  });

  return {
    scored,
    conceded
  }
}

export function getStats(event: string, homeTeamGoals: any, awayTeamGoals: any) {
  let result: number[] = [];

  if (event === 'Goals Over/Under') {
    result = homeTeamGoals.scored.concat(awayTeamGoals.scored);
  } else if (event === 'Total - Home') {
    result = homeTeamGoals.scored.concat(awayTeamGoals.conceded);
  } else if (event === 'Total - Away') {
    result = homeTeamGoals.conceded.concat(awayTeamGoals.scored);
  }

  return result;
}

export function filterProbabilities(data: any) {
  const result: any = {};

  const underCandidates = data.under.filter((item: any) => item.probability > 75);
  if (underCandidates.length > 0) {
    result.under = underCandidates.reduce((min: any, item: any) => item.value < min.value ? item : min);
  }

  const overCandidates = data.over.filter((item: any) => item.probability > 75);
  if (overCandidates.length > 0) {
    result.over = overCandidates.reduce((max: any, item: any) => item.value > max.value ? item : max);
  }

  return result;
}