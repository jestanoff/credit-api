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
      data: { amount: parseInt(amount, 16) },
      method: 'POST',
      timeout: 5000,
      url: `api/cards/${cardId}/deposit`,
    });
    const { data } = req || { data: {} };
    return data && data.balance.toString(16).padStart(4, '0');
  } catch (err) {
    if (err.response && err.response.data) {
      console.log(err.response.data.message);
    } else {
      console.error(err);
    }
  }
  return null;
};
