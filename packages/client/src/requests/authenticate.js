import axios from 'axios';
import env from '../environment.js';

export default async () => {
  try {
    const req = await axios.request({
      baseURL: env.server,
      headers: { 'Content-Type': 'application/json' },
      data: { password: '12345', username: 'admin' },
      method: 'POST',
      url: '/authenticate',
    });
    const { data } = req || { data: {} };

    if (data.message === 'Authentication successful') {
      return data.token;
    }
  } catch (err) {
    if (err.response && err.response.data) {
      console.log(err.response.data.message);
    } else {
      console.error(err);
    }
  }
  return null;
};
