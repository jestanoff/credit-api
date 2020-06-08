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
      url: `api/cards/${cardId}/deposit`,
    });
    const { data } = req || { data: {} };
    return data && data.balance.toString(16).padStart(4, '0');
  } catch (err) {
    if (err.response && err.response.data) {
      console.log(`${getTimestamp()} ERROR ${err.response.data.message}`);
    } else if (err.response) {
      console.log(`${getTimestamp()} ERROR ${err.response.status} ${err.response.statusText}`);
    } else {
      console.log(`${getTimestamp()} ERROR ${err}`);
    }
  }
  return null;
};
