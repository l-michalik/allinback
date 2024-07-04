import { ILeague, League } from '../../models';
import dbConnect from '../../lib/dbConnect'
import { createOptions, isArrayEmpty, preventRepeats } from '../../lib/utils';

const axios = require('axios');

export const createLeagues = async () => {
  const documents: ILeague[] = [];

  const options = createOptions({
    path: 'leagues',
    params: {}
  });

  try {
    const response = await axios.request(options);

    const data = response.data.response.map((doc: any) => {
      const league = doc.league;

      return {
        id: league.id,
        name: league.name,
        logo: league.logo,
        active: false,
      }
    });

    documents.push(...data);
  } catch (error) {
    console.error(error);
  }

  if (isArrayEmpty(documents)) return;

  const data = preventRepeats(documents);

  try {
    await dbConnect();

    await League.bulkWrite(data);
    console.log('Leagues created successfully!');

  } catch (error) {
    console.log(error);
  }
};