const axios = require('axios');

const Form = require('./form');

const DEFAULT_TIMEOUT = 10000;
const WRITE_TIMEOUT = 60000;

class BlockStorage {
  constructor({ endpoint }) {
    this.endpoint = endpoint.replace(/\/$/, '');
    this.axios = axios.create({
      timeout: DEFAULT_TIMEOUT,
      maxRedirects: 2,
    });
  }

  async reserve({ count }) {
    const { data: { fid: name } } = await this.axios({
      method: 'GET',
      url: `${this.endpoint}/dir/assign`,
      params: {
        count,
      },
    });

    return { name };
  }

  async add({ data }) {
    const formData = Form.create({ file: data });

    const { data: { fid: name, size } } = await this.axios({
      method: 'POST',
      url: `${this.endpoint}/submit`,
      headers: formData.getHeaders(),
      data: formData,
      timeout: WRITE_TIMEOUT,
    });

    return { name, size };
  }

  async replace({ data, name }) {
    const formData = Form.create({ file: data });

    const { data: { size } } = await this.axios({
      method: 'POST',
      url: `${this.endpoint}/${name}`,
      headers: formData.getHeaders(),
      data: formData,
      timeout: WRITE_TIMEOUT,
    });

    return { name, size };
  }

  async get({ name }) {
    const { data: stream } = await this.axios({
      method: 'GET',
      url: `${this.endpoint}/${name}`,
      responseType: 'stream',
    });

    return stream;
  }

  async delete({ name }) {
    try {
      await this.axios({
        method: 'DELETE',
        url: `${this.endpoint}/${name}`,
      });

      return true;
    }
    catch (error) {
      const data = (
        error
        && error.response
        && error.response.data
      );

      if (data && ('size' in data)) {
        return true;
      }

      throw error;
    }
  }
}

module.exports = BlockStorage;
