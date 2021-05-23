const fs = require('fs');
const process = require('process');

const BlockStorage = require('../lib/block-storage');

describe('block-storage.js', () => {
  describe('BlockStorage', () => {
    const defaultBlockStorage = new BlockStorage({
      endpoint: process.env.SEAWEEDFS_ENDPOINT,
    });

    const notfoundBlockStorage = new BlockStorage({
      endpoint: 'http://example.com',
    });

    const testGetFile = async ({
      blockStorage,
      fid,
      expectExistent,
      expectedData,
    }) => {
      let stream;
      try {
        stream = await blockStorage.get({ fid });
      }
      catch (error) {
        stream = null;
      }

      return new Promise((resolve, reject) => {
        if (expectExistent) {
          expect(stream).toBeDefined();

          let receivedData = '';
          stream.on('data', chunk => {
            receivedData += chunk.toString();
          });
          stream.on('end', () => {
            expect(receivedData).toEqual(expectedData);
            resolve();
          });
          stream.on('error', reject);
        }
        else {
          expect(stream).toBeNull();
          resolve();
        }
      });
    };

    describe('constructor()', () => {
      test('should fail (invalid end point)', () => {
        [
          undefined,
          {},
          { endpoint: null },
        ].forEach(args => {
          expect(() => new BlockStorage(args)).toThrow();
        });
      });

      test('should success', () => {
        const baseEndpoint = 'http://localhost:9333';
        [baseEndpoint, `${baseEndpoint}/`].forEach(endpoint => {
          expect(new BlockStorage({ endpoint }).endpoint)
            .toEqual(baseEndpoint);
        });
      });
    });

    describe('workflow', () => {
      test('add() => fail (invalid end point)', async () => {
        const blockStorage = notfoundBlockStorage;
        const addData = 'Hello World';

        expect(blockStorage.add({
          data: addData,
        })).rejects.toThrow('404');
      });

      test('add() + get() => success', async () => {
        const blockStorage = defaultBlockStorage;
        const addData = 'Hello World';

        const addResult = await blockStorage.add({
          data: addData,
        });
        expect(addResult).toBeTruthy();
        expect(addResult.fid).toBeTruthy();
        expect(addResult.size).toBeGreaterThan(0);

        await testGetFile(({
          blockStorage,
          fid: addResult.fid,
          expectExistent: true,
          expectedData: addData,
        }));
      });

      test('add() + get() => stream success', async () => {
        const blockStorage = defaultBlockStorage;
        const fileName = __filename;
        const addData = fs.createReadStream(fileName);
        const addDataContent = fs.readFileSync(fileName, 'utf-8');

        const addResult = await blockStorage.add({
          data: addData,
        });
        expect(addResult).toBeTruthy();
        expect(addResult.fid).toBeTruthy();
        expect(addResult.size).toBeGreaterThan(0);

        await testGetFile(({
          blockStorage,
          fid: addResult.fid,
          expectExistent: true,
          expectedData: addDataContent,
        }));
      });

      test('replace() => fail (invalid name)', async () => {
        const blockStorage = defaultBlockStorage;
        const replaceData = 'Hi World';

        expect(blockStorage.replace({
          data: replaceData,
          fid: 'unknown',
        })).rejects.toThrow('404');
      });

      test('add() + replace() + get() => success', async () => {
        const blockStorage = defaultBlockStorage;
        const addData = 'Hello World';
        const replaceData = 'Hi World';

        const addResult = await blockStorage.add({
          data: addData,
        });
        expect(addResult).toBeTruthy();
        expect(addResult.fid).toBeTruthy();
        expect(addResult.size).toBeGreaterThan(0);

        const replaceResult = await blockStorage.replace({
          data: replaceData,
          fid: addResult.fid,
        });
        expect(replaceResult).toBeTruthy();
        expect(replaceResult.fid).toEqual(addResult.fid);
        expect(replaceResult.size).toBeGreaterThan(0);

        await testGetFile(({
          blockStorage,
          fid: addResult.fid,
          expectExistent: true,
          expectedData: replaceData,
        }));
      });

      test('add() + replace() + get() => stream success', async () => {
        const blockStorage = defaultBlockStorage;
        const addData = 'Hello World';
        const fileName = __filename;
        const replaceData = fs.createReadStream(fileName);
        const replaceDataContent = fs.readFileSync(fileName, 'utf-8');

        const addResult = await blockStorage.add({
          data: addData,
        });
        expect(addResult).toBeTruthy();
        expect(addResult.fid).toBeTruthy();
        expect(addResult.size).toBeGreaterThan(0);

        const replaceResult = await blockStorage.replace({
          data: replaceData,
          fid: addResult.fid,
        });
        expect(replaceResult).toBeTruthy();
        expect(replaceResult.fid).toEqual(addResult.fid);
        expect(replaceResult.size).toBeGreaterThan(0);

        await testGetFile(({
          blockStorage,
          fid: addResult.fid,
          expectExistent: true,
          expectedData: replaceDataContent,
        }));
      });

      test('reserve() => fail (invalid end point)', async () => {
        const blockStorage = notfoundBlockStorage;

        expect(blockStorage.reserve({
          count: 10,
        })).rejects.toThrow('404');
      });

      test('reserve() + replace() + get() => success', async () => {
        const blockStorage = defaultBlockStorage;
        const reserveCount = 10;

        const reserveResult = await blockStorage.reserve({
          count: reserveCount,
        });
        expect(reserveResult.fid).toBeTruthy();

        for (let i = 0; i < reserveCount; i += 1) {
          const fid = `${reserveResult.fid}${i > 0 ? `_${i}` : ''}`;
          const replaceData = `Hi World: ${i}`;

          // eslint-disable-next-line no-await-in-loop
          const replaceResult = await blockStorage.replace({
            data: replaceData,
            fid,
          });
          expect(replaceResult).toBeTruthy();
          expect(replaceResult.fid).toEqual(fid);
          expect(replaceResult.size).toBeGreaterThan(0);

          // eslint-disable-next-line no-await-in-loop
          await testGetFile(({
            blockStorage,
            fid,
            expectExistent: true,
            expectedData: replaceData,
          }));
        }
      });

      test('reserve() + replace() + get() => stream success', async () => {
        const blockStorage = defaultBlockStorage;
        const reserveCount = 10;
        const fileName = __filename;
        const replaceDataContent = fs.readFileSync(fileName, 'utf-8');

        const reserveResult = await blockStorage.reserve({
          count: reserveCount,
        });
        expect(reserveResult.fid).toBeTruthy();

        for (let i = 0; i < reserveCount; i += 1) {
          const replaceData = fs.createReadStream(fileName);
          const fid = `${reserveResult.fid}${i > 0 ? `_${i}` : ''}`;

          // eslint-disable-next-line no-await-in-loop
          const replaceResult = await blockStorage.replace({
            data: replaceData,
            fid,
          });
          expect(replaceResult).toBeTruthy();
          expect(replaceResult.fid).toEqual(fid);
          expect(replaceResult.size).toBeGreaterThan(0);

          // eslint-disable-next-line no-await-in-loop
          await testGetFile(({
            blockStorage,
            fid,
            expectExistent: true,
            expectedData: replaceDataContent,
          }));
        }
      });

      test('get() => fail (invalid name)', async () => {
        const blockStorage = defaultBlockStorage;
        await testGetFile(({
          blockStorage,
          fid: 'unknown',
          expectExistent: false,
        }));
      });

      test('delete() => fail (invalid name)', async () => {
        const blockStorage = defaultBlockStorage;

        expect(blockStorage.delete({
          fid: 'unknown',
        })).rejects.toThrow('404');
      });

      test('delete() => success', async () => {
        const blockStorage = defaultBlockStorage;

        const deleteResult = await blockStorage.delete({
          fid: '1,unknown',
        });
        expect(deleteResult).toBe(true);
      });

      test('add() + delete() + get() => success', async () => {
        const blockStorage = defaultBlockStorage;
        const addData = 'Hello World';

        const addResult = await blockStorage.add({
          data: addData,
        });
        expect(addResult).toBeTruthy();
        expect(addResult.fid).toBeTruthy();
        expect(addResult.size).toBeGreaterThan(0);

        const deleteResult = await blockStorage.delete({
          fid: addResult.fid,
        });
        expect(deleteResult).toBe(true);

        await testGetFile(({
          blockStorage,
          fid: addResult.fid,
          expectExistent: false,
        }));
      });

      test('add() + replace() + delete() + get() => success', async () => {
        const blockStorage = defaultBlockStorage;
        const addData = 'Hello World';
        const replaceData = 'Hi World';

        const addResult = await blockStorage.add({
          data: addData,
        });
        expect(addResult).toBeTruthy();
        expect(addResult.fid).toBeTruthy();
        expect(addResult.size).toBeGreaterThan(0);

        const replaceResult = await blockStorage.replace({
          data: replaceData,
          fid: addResult.fid,
        });
        expect(replaceResult).toBeTruthy();
        expect(replaceResult.fid).toEqual(addResult.fid);
        expect(replaceResult.size).toBeGreaterThan(0);

        const deleteResult = await blockStorage.delete({
          fid: addResult.fid,
        });
        expect(deleteResult).toBe(true);

        await testGetFile(({
          blockStorage,
          fid: addResult.fid,
          expectExistent: false,
        }));
      });
    });
  });
});
