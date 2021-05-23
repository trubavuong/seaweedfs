const axios = require('axios');

const Form = require('./form');

class BlockStorage {
  constructor(endpoint) {
    this.endpoint = endpoint.replace(/\/$/, '');
    this.axios = axios.create({
      maxRedirects: 2,
    });
  }

  async ping({ timeout = 0 } = {}) {
    await this.axios({
      method: 'GET',
      url: this.endpoint,
      timeout,
    });
  }

  async reserve(count, { timeout = 0 } = {}) {
    const result = await this.axios({
      method: 'GET',
      url: `${this.endpoint}/dir/assign`,
      params: { count },
      timeout,
    });

    return result.data;
  }

  async add(data, { timeout = 0 } = {}) {
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

  async replace(fid, data, { timeout = 0 } = {}) {
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

  async get(fid, { timeout = 0 } = {}) {
    const result = await this.axios({
      method: 'GET',
      url: `${this.endpoint}/${fid}`,
      responseType: 'stream',
      timeout,
    });

    return result.data;
  }

  async delete(fid, { timeout = 0 } = {}) {
    try {
      await this.axios({
        method: 'DELETE',
        url: `${this.endpoint}/${fid}`,
        timeout,
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
