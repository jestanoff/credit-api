import axios from 'axios';
import env from '../environment.js';
import getTimestamp from '../getTimestamp.js';

export default async ({ amount, authToken, cardId }) => {
  try {
    const req = await axios.request({
      baseURL: env.server,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      data: { amount },
      method: 'POST',
      timeout: 5000,
      url: `api/cards/${cardId}/withdraw`,
    });
    const { data } = req || { data: {} };
    return data && data.balance.toString(16).padStart(4, '0');
  } catch (err) {
    throw err;
  }
};
