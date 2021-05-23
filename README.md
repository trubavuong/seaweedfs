# seaweedfs

NodeJS client for [SeaweedFS](https://github.com/chrislusf/seaweedfs)

## Install

```
$ npm install @trubavuong/seaweedfs
```

## APIs

### BlockStorage

```
const { BlockStorage } = require('@trubavuong/seaweedfs');
```

#### Constructor

```
const blockStorage = new BlockStorage('http://localhost:9333');
```

#### blockStorage.ping([{ timeout = 0 } = {}])

```
await blockStorage.ping();
```

#### blockStorage.reserve(count[, { timeout = 0 } = {}])

```
/*
{
  fid: '5,012d21951980',
  url: '192.168.0.105:3838',
  publicUrl: '192.168.0.105:3838',
  count: 10,
}
*/
const result = await blockStorage.reserve(10);
```

#### blockStorage.add(data[, { timeout = 0 } = {}])

```
/*
{
  eTag: 'b85365fc',
  fid: '1,013aeeb4df9c',
  fileName: 'block-storage.test.js',
  fileUrl: '192.168.0.105:3838/1,013aeeb4df9c',
  size: 10352,
}
*/
const result = await blockStorage.add(fileData);
```

#### blockStorage.replace(fid, data[, { timeout = 0 } = {}])

```
/*
{
  fid: '1,013aeeb4df9c', // added by this lib
  name: 'block-storage.test.js',
  size: 10352,
  eTag: 'b85365fc',
}
*/
const result = await blockStorage.replace(fid, fileData);
```

#### blockStorage.get(fid[, { timeout = 0 } = {}])

```
const fileStream = await blockStorage.get(fid);
```

#### blockStorage.delete(fid[, { timeout = 0 } = {}])

```
await blockStorage.delete(fid);
```
