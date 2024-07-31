import { ITeam, Team } from "../models";
import { ILikelyType, IOptions } from "../types";

export const createOptions = ({ params, path }: IOptions) => {
  return {
    method: "GET",
    url: `https://api-football-v1.p.rapidapi.com/v3/${path}`,
    params: params,
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY,
      "x-rapidapi-host": process.env.RAPID_API_HOST,
    },
  };
};

export const isArrayEmpty = (arr: any[]) => {
  return !Array.isArray(arr) || arr.length === 0;
};

export function formatDate(dateString: string): string {
  const date: Date = new Date(dateString);
  
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long'
  };

  return date.toLocaleDateString('en-US', options);
}

export function padStringWithSpaces(str: string, targetLength: number): string {
  return str.padEnd(targetLength, ' ');
}

export function getPercentage(value: number, total: number): number {
  return (value / total) * 100;
}

export function groupByFixtureId(elements: ILikelyType[]): Record<number, ILikelyType[]> {
  return elements.reduce((accumulator, current) => {
    if (!accumulator[current.fixtureId]) {
      accumulator[current.fixtureId] = [];
    }
    accumulator[current.fixtureId].push(current);
    return accumulator;
  }, {} as Record<number, ILikelyType[]>);
}

export async function insertOrUpdateTeams(documents: ITeam[]) {
  for (const doc of documents) {
    // Check if the team with the given ID already exists
    const existingTeam = await Team.findOne({ id: doc.id });

    if (existingTeam) {
      // If the team exists, check if the season year already exists
      if (!existingTeam.season.includes(doc.season[0])) { // Assuming doc.season is an array with one year
        // Add the year to the season array
        existingTeam.season.push(doc.season[0]);
        await existingTeam.save();
      }
    } else {
      // If the team does not exist, insert the new document
      await Team.create(doc);
    }
  }
}