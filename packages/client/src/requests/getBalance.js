import axios from 'axios';
import env from '../environment.js';
import createCard from './createCard.js';

export default async ({ authToken, cardId }) => {
  try {
    const req = await axios.request({
      baseURL: env.server,
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      method: 'GET',
      timeout: 5000,
      url: `api/cards/${cardId}/balance`,
    });
    const { data } = req || { data: {} };
    return data && data.balance.toString(16).padStart(4, '0');
  } catch (err) {
    if (err.response.data.code === 'CARD_NOT_FOUND') {
      let balance = await createCard({ authToken, cardId });
      return balance;
    }

    if (err.response && err.response.data) {
      throw new Error(`${err.response.data.message} ${cardId}`);
    }
    throw err;
  }
};
