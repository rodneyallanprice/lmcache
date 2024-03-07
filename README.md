# LMCache - Local Memory Cache

LMCache is used to provide a local memory cache with the following characteristics:

- The code is 100% javascript with no runtime dependencies
- The find() and add() methods use a constant time: O(1) algorithm.
  Speed does not vary with cache size.
- Cache misses are just as fast (maybe faster) than cache hits.
- Adding an item with the same key as an existing item will update the data of the existing item.
- The memory usage is managed inline and automatically.
  There is no monitor thread or garbage collector.
- Least recently touched cached items are removed when:
  - the number of entries reach the configured max
  - an entry is untouched for the configured number of seconds

# Uses

LMCache is ideal for NodeJS applications that frequently lookup static or near-static data from databases or remote servers, especially when these circumstances exist in the cloud where charges are incurred for redundant lookups.

LMCache is perfect when retrieved data must be transformed or reduced for local consumtion and the transform will be reused.

# Install

```
npm i lmcache

```

# Build

```
tsc

```

# Usage:

```
const Cache = require('lmcache');


cache = new Cache(max_cache_items, max_seconds_unused);

cache.add(key, data);

const data = cache.find(key);
```

# APIs

## new Cache()

#### Syntax

```
Cache()
Cache(max_cache_items: number)
Cache(max_cache_items: number, max_seconds_unused: number)

```

#### Parameters

    max_cache_items (number)
        The number of unique keys that can be cached before least recently touched cached items are released

    max_seconds_unused (number)
        The number of seconds usused items are allowed to remain in the cache.

#### Return value

    An instance of the LMCache class

## add()

#### Syntax

```
add(key: number, data: any)

```

#### Parameters

    key (string) (required)
        A unique string that can be used to retrieve the data with the find() method

    data (any) (required)
        The data that will be cached

#### Return value

    void

## find()

#### Syntax

```
find(key: string);

```

#### Parameters

    key (string) (required)
        The key needed to find the data in the cache.

#### Return value

    The data will be return if the key still exists.
    Otherwise null is returned.

# Unit tests

```
npm test

```
