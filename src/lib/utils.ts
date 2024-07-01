export const isArrayEmpty = (arr: any[]) => {
  return !Array.isArray(arr) || arr.length === 0
};

export const preventRepeats = (arr: any[]) => {
  return arr.map((doc: any) => ({
    updateOne: {
      filter: { id: doc.id },
      update: { $set: doc },
      upsert: true
    }
  }));
};

export const createOptions = () => {
  return {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/leagues',
    headers: {
      'x-rapidapi-key': process.env.RAPID_API_KEY,
      'x-rapidapi-host': process.env.RAPID_API_HOST
    }
  }
}