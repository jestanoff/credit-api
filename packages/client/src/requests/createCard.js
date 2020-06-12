import axios from 'axios';
import env from '../environment.js';
import getTimestamp from '../getTimestamp.js';

export default async ({ authToken, cardId }) => {
  try {
    const req = await axios.request({
      baseURL: env.server,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: { amount: 0 },
      method: 'POST',
      url: `api/cards/${cardId}`,
    });
    const { data } = req || { data: {} };
    return data && data.balance && data.balance.toString(16).padStart(4, '0');
  } catch (err) {
    if (err.response && err.response.data) {
      throw new Error(`${err.response.data.message} ${cardId}`);
    }
    throw err;
  }
};
