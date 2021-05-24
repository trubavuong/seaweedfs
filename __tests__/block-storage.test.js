const fs = require('fs');
const process = require('process');

const BlockStorage = require('../lib/block-storage');

describe('block-storage.js', () => {
  describe('BlockStorage', () => {
    const defaultBlockStorage = new BlockStorage(process.env.SEAWEEDFS_ENDPOINT);

    const notfoundBlockStorage = new BlockStorage('http://localhost:6666');

    const testGetFile = async ({
      blockStorage,
      fid,
      expectExistent,
      expectedData,
    }) => {
      let stream;
      try {
        stream = await blockStorage.get(fid);
      }
      catch (error) {
        stream = null;
      }

      return new Promise((resolve, reject) => {
        if (expectExistent) {
          expect(stream).toBeTruthy();

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
          null,
        ].forEach(args => {
          expect(() => new BlockStorage(args)).toThrow();
        });
      });

      test('should success', () => {
        const baseEndpoint = 'http://localhost:9333';
        [baseEndpoint, `${baseEndpoint}/`].forEach(endpoint => {
          expect(new BlockStorage(endpoint).endpoint)
            .toEqual(baseEndpoint);
        });
      });
    });

    describe('ping()', () => {
      test('should fail (invalid endpoint)', async () => {
        const blockStorage = notfoundBlockStorage;

        await expect(blockStorage.ping()).rejects.toThrow('ECONNREFUSED');
      });

      test('should success', async () => {
        const blockStorage = defaultBlockStorage;

        await expect(blockStorage.ping()).resolves.toBeUndefined();
      });
    });

    describe('workflow', () => {
      test('add() => fail (invalid end point)', async () => {
        const blockStorage = notfoundBlockStorage;
        const addData = 'Hello World';

        await expect(blockStorage.add(addData)).rejects.toThrow('ECONNREFUSED');
      });

      test('add() + get() => success', async () => {
        const blockStorage = defaultBlockStorage;
        const addData = 'Hello World';

        const addResult = await blockStorage.add(addData);
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

        const addResult = await blockStorage.add(addData);
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

        await expect(blockStorage.replace('unknown', replaceData)).rejects.toThrow('404');
      });

      test('add() + replace() + get() => success', async () => {
        const blockStorage = defaultBlockStorage;
        const addData = 'Hello World';
        const replaceData = 'Hi World';

        const addResult = await blockStorage.add(addData);
        expect(addResult).toBeTruthy();
        expect(addResult.fid).toBeTruthy();
        expect(addResult.size).toBeGreaterThan(0);

        const replaceResult = await blockStorage.replace(
          addResult.fid,
          replaceData,
        );
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

        const addResult = await blockStorage.add(addData);
        expect(addResult).toBeTruthy();
        expect(addResult.fid).toBeTruthy();
        expect(addResult.size).toBeGreaterThan(0);

        const replaceResult = await blockStorage.replace(
          addResult.fid,
          replaceData,
        );
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

        await expect(blockStorage.reserve(10)).rejects.toThrow('ECONNREFUSED');
      });

      test('reserve() + replace() + get() => success', async () => {
        const blockStorage = defaultBlockStorage;
        const reserveCount = 10;

        const reserveResult = await blockStorage.reserve(reserveCount);
        expect(reserveResult.fid).toBeTruthy();

        for (let i = 0; i < reserveCount; i += 1) {
          const fid = `${reserveResult.fid}${i > 0 ? `_${i}` : ''}`;
          const replaceData = `Hi World: ${i}`;

          // eslint-disable-next-line no-await-in-loop
          const replaceResult = await blockStorage.replace(
            fid,
            replaceData,
          );
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

        const reserveResult = await blockStorage.reserve(reserveCount);
        expect(reserveResult.fid).toBeTruthy();

        for (let i = 0; i < reserveCount; i += 1) {
          const replaceData = fs.createReadStream(fileName);
          const fid = `${reserveResult.fid}${i > 0 ? `_${i}` : ''}`;

          // eslint-disable-next-line no-await-in-loop
          const replaceResult = await blockStorage.replace(
            fid,
            replaceData,
          );
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

        await expect(blockStorage.delete('unknown')).rejects.toThrow('404');
      });

      test('delete() => success', async () => {
        const blockStorage = defaultBlockStorage;

        await expect(blockStorage.delete('1,unknown')).resolves.toBeUndefined();
      });

      test('add() + delete() + get() => success', async () => {
        const blockStorage = defaultBlockStorage;
        const addData = 'Hello World';

        const addResult = await blockStorage.add(addData);
        expect(addResult).toBeTruthy();
        expect(addResult.fid).toBeTruthy();
        expect(addResult.size).toBeGreaterThan(0);

        await expect(blockStorage.delete(addResult.fid)).resolves.toBeUndefined();

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

        const addResult = await blockStorage.add(addData);
        expect(addResult).toBeTruthy();
        expect(addResult.fid).toBeTruthy();
        expect(addResult.size).toBeGreaterThan(0);

        const replaceResult = await blockStorage.replace(
          addResult.fid,
          replaceData,
        );
        expect(replaceResult).toBeTruthy();
        expect(replaceResult.fid).toEqual(addResult.fid);
        expect(replaceResult.size).toBeGreaterThan(0);

        await expect(blockStorage.delete(addResult.fid)).resolves.toBeUndefined();

        await testGetFile(({
          blockStorage,
          fid: addResult.fid,
          expectExistent: false,
        }));
      });
    });
  });
});
