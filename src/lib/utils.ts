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
  return Match
    .find({
      $or: [
        { "teams.home": team },
        { "teams.away": team },
      ],
      timestamp: {
        $lt: date.getTime() / 1000,
      }
    })
    .limit(5)
    .sort({ timestamp: -1 })
    .select('goals')
}

export function getFixturePrediction(value: number, stats: number[]) {
  const bookmakerRate = 1.00;
  const greater = (stats.filter(stat => stat > value).length / stats.length * 100).toFixed(2);
  const less = (stats.filter(stat => stat < value).length / stats.length * 100).toFixed(2);

  return `-${value} | ${less}% | ${bookmakerRate} [x] +${value} | ${greater}% | ${bookmakerRate}`
}

export function getTeamGoals(matches: any) {
  let scored: number[] = [], conceded: number[] = [];

  matches.map((match: IMatch) => {
    scored.push(match.goals.home);
    conceded.push(match.goals.away);
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