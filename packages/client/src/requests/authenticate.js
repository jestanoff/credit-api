import axios from 'axios';
import env from '../environment.js';
import getTimestamp from '../getTimestamp.js';
import log from '../log.js'

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
      log(`${getTimestamp()} Authenticated with auth token from ${env.server}`);
      return data.token;
    }
  } catch (err) {
    if (err.response && err.response.status && err.response.status >= 500) {
      log(`${getTimestamp()} ERROR    ${err.response.status} ${err.response.statusText}`);
      return undefined;
    }

    if (err.response && err.response.data) {
      log(err.response.data.message);
    } else {
      log(err);
    }
  }
  return undefined;
};
