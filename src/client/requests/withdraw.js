import axios from 'axios';
import env from '../environment.js';

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
      url: `api/cards/${cardId}/withdraw`,
    });
    const { data } = req || { data: {} };
    return data && data.balance;
  } catch (err) {
    if (err.response && err.response.data) {
      console.log(err.response.data.message);
    } else {
      console.error(err);
    }
  }
  return null;
};
