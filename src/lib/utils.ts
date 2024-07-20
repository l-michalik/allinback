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

export function getNextDay() {
  const today = new Date();

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}