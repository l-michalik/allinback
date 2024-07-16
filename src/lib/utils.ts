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