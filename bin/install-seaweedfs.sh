#!/bin/bash

SEAWEEDFS_BIN=./weed
SEAWEEDFS_ARCHIVE=weed-$SEAWEEDFS_VERSION.tar.gz
SEAWEEDFS_DOWNLOAD_URL=https://github.com/chrislusf/seaweedfs/releases/download/$SEAWEEDFS_VERSION/linux_amd64.tar.gz

if [ ! -x $SEAWEEDFS_BIN ]
  then
    wget $SEAWEEDFS_DOWNLOAD_URL -O $SEAWEEDFS_ARCHIVE
    tar xvf $SEAWEEDFS_ARCHIVE
    rm $SEAWEEDFS_ARCHIVE
fi
