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
const { name } = blockStorage.reserve({
  count: 10,
});
```

#### blockStorage.add({ data })

```
const { name, size } = blockStorage.add({
  data: fileData,
});
```

#### blockStorage.replace({ data, name })

```
const { name, size } = blockStorage.replace({
  name: fid,
  data: fileData,
});
```

#### blockStorage.get({ name })

```
const fileStream = blockStorage.get({
  name: fid,
});
```

#### blockStorage.delete({ name })

```
const isDeleted = blockStorage.delete({
  name: fid,
});
```
