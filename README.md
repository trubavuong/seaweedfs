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
const blockStorage = new BlockStorage({
  endpoint: 'http://localhost:9333',
  timeout: 1000, // optional, default HTTP timeout in ms, default 10000
});
```

#### blockStorage.reserve({ count })

```
/*
{
  fid: '5,012d21951980',
  url: '192.168.0.105:3838',
  publicUrl: '192.168.0.105:3838',
  count: 10,
}
*/
const result = await blockStorage.reserve({
  count: 10,
});
```

#### blockStorage.add({ data, timeout })

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
const result = await blockStorage.add({
  data: fileData,
  timeout: 5000, // optional, HTTP timeout, default 60000
});
```

#### blockStorage.replace({ fid, data, timeout })

```
/*
{
  fid: '1,013aeeb4df9c', // added by this lib
  name: 'block-storage.test.js',
  size: 10352,
  eTag: 'b85365fc',
}
*/
const result = await blockStorage.replace({
  fid,
  data: fileData,
  timeout: 5000, // optional, HTTP timeout, default 60000
});
```

#### blockStorage.get({ fid })

```
const fileStream = await blockStorage.get({
  fid,
});
```

#### blockStorage.delete({ fid })

```
const isDeleted = await blockStorage.delete({
  fid,
});
```
