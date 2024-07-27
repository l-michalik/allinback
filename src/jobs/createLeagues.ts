import { createOptions, isArrayEmpty } from "../utils";
import { League } from "../models/Leagues";
import dbConnect from "../lib/dbConnect";

const axios = require('axios');

export const createLeagues = async () => {
  const documents = [];

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

  try {
    await dbConnect();

    await League.insertMany(documents);
    console.log('Leagues created successfully!');

  } catch (error) {
    console.log(error);
  }
};