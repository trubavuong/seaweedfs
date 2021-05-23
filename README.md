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
});
```

#### blockStorage.reserve({ count })

```
const { name } = await blockStorage.reserve({
  count: 10,
});
```

#### blockStorage.add({ data })

```
const { name, size } = await blockStorage.add({
  data: fileData,
});
```

#### blockStorage.replace({ data, name })

```
const { name, size } = await blockStorage.replace({
  name: fid,
  data: fileData,
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
