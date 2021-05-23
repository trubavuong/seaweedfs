const axios = require('axios');

const Form = require('./form');

const DEFAULT_TIMEOUT = 10000;
const WRITE_TIMEOUT = 60000;

class BlockStorage {
  constructor({ endpoint, timeout = DEFAULT_TIMEOUT }) {
    this.endpoint = endpoint.replace(/\/$/, '');
    this.axios = axios.create({
      timeout,
      maxRedirects: 2,
    });
  }

  async reserve({ count }) {
    const result = await this.axios({
      method: 'GET',
      url: `${this.endpoint}/dir/assign`,
      params: { count },
    });

    return result.data;
  }

  async add({ data, timeout = WRITE_TIMEOUT }) {
    const formData = Form.create({ file: data });

    const result = await this.axios({
      method: 'POST',
      url: `${this.endpoint}/submit`,
      headers: formData.getHeaders(),
      data: formData,
      timeout,
    });

    return result.data;
  }

  async replace({ data, fid, timeout = WRITE_TIMEOUT }) {
    const formData = Form.create({ file: data });

    const result = await this.axios({
      method: 'POST',
      url: `${this.endpoint}/${fid}`,
      headers: formData.getHeaders(),
      data: formData,
      timeout,
    });

    return {
      fid,
      ...result.data,
    };
  }

  async get({ fid }) {
    const result = await this.axios({
      method: 'GET',
      url: `${this.endpoint}/${fid}`,
      responseType: 'stream',
    });

    return result.data;
  }

  async delete({ fid }) {
    try {
      await this.axios({
        method: 'DELETE',
        url: `${this.endpoint}/${fid}`,
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
