const index = require('../lib/index');

describe('index.js', () => {
  test('should contain modules', () => {
    ['BlockStorage'].forEach(property => {
      expect(index).toHaveProperty(property);
    });
  });
});
