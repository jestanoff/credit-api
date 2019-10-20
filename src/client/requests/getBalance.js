import axios from 'axios';

export default async ({ authToken, cardId }) => {
  try {
    const req = await axios.request({
      baseURL: 'https://localhost',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      method: 'GET',
      url: `api/cards/${cardId}/balance`,
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
