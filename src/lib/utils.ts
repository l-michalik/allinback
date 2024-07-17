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

export function getTomorrowStartTimestamp(): number {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return Math.floor(tomorrow.getTime() / 1000);
}

export function getDayAfterTomorrowStartTimestamp(): number {
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  dayAfterTomorrow.setHours(0, 0, 0, 0);
  return Math.floor(dayAfterTomorrow.getTime() / 1000);
}

export function getFormattedDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return tomorrow.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}