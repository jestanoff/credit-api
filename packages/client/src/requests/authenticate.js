import axios from 'axios';
import env from '../environment.js';
import getTimestamp from '../getTimestamp.js';

export default async () => {
  try {
    const req = await axios.request({
      baseURL: env.server,
      headers: { 'Content-Type': 'application/json' },
      data: { password: '12345', username: 'admin' },
      method: 'POST',
      timeout: 30000,
      url: '/authenticate',
    });
    const { data } = req || { data: {} };

    if (data.message === 'Authentication successful') {
      console.log(`${getTimestamp()} Authenticated with auth token from ${env.server}`);
      return data.token;
    }
  } catch (err) {
    if (err.response && err.response.status && err.response.status >= 500) {
      console.log(`${getTimestamp()} ERROR    ${err.response.status} ${err.response.statusText}`);
      return undefined;
    }

    if (err.response && err.response.data) {
      console.log(err.response.data.message);
    } else {
      console.error(err);
    }
  }
  return undefined;
};
