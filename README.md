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
const { name } = await blockStorage.reserve({
  count: 10,
});
```

#### blockStorage.add({ data, timeout })

```
const { name, size } = await blockStorage.add({
  data: fileData,
  timeout: 5000, // optional, HTTP timeout, default 60000
});
```

#### blockStorage.replace({ data, name, timeout })

```
const { name, size } = await blockStorage.replace({
  name: fid,
  data: fileData,
  timeout: 5000, // optional, HTTP timeout, default 60000
});
```

#### blockStorage.get({ name })

```
const fileStream = await blockStorage.get({
  name: fid,
});
```

#### blockStorage.delete({ name })

```
const isDeleted = await blockStorage.delete({
  name: fid,
});
```
