const FormData = require('form-data');

const Form = {
  create: params => {
    const formData = new FormData();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    return formData;
  },
};

module.exports = Form;
