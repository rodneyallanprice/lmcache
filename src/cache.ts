type CacheNode = {
  bucket: {
    next: CacheNode | null;
    prev: CacheNode | null;
  };
  age: {
    next: CacheNode | null;
    prev: CacheNode | null;
  };
  bucketIdx: number;
  lastUsed: number;
  key: string;
  data: any;
};

type ExternalCacheNode = {
  key: string;
  data: any;
};

const DEFAULT_MAX_KEYS = 100;
const DEFAULT_CACHE_TIMEOUT = 5 * 60;
const DEFAULT_CACHE_DEPTH = 1;

class LMCache {
  private maxKeys: number;
  private bucketCount: number;
  private maxCacheTime: number;
  private buckets: (CacheNode | null | undefined)[];
  private ageHead: CacheNode | null;
  private ageTail: CacheNode | null;
  private used: number;

  constructor(
    maxKeys: number = DEFAULT_MAX_KEYS,
    maxCacheTime: number = DEFAULT_CACHE_TIMEOUT,
    depth: number = DEFAULT_CACHE_DEPTH
  ) {
    this.ageHead = null;
    this.ageTail = null;
    this.used = 0;
    this.maxKeys = maxKeys;
    this.maxCacheTime = maxCacheTime * 1000;
    let bucketDepth = DEFAULT_CACHE_DEPTH;
    if (depth && depth <= this.maxKeys / 2) {
      bucketDepth = depth;
    }
    this.bucketCount = this.maxKeys / bucketDepth;
    this.buckets = new Array(this.bucketCount);
  }

  private hash(id: string) {
    let h = 0;
    for (let i = 0; i < id.length; i++) {
      h = 37 * h + id.charCodeAt(i);
    }
    return h % this.bucketCount;
  }

  private removeNodeFromAgeList(node: CacheNode) {
    if (node.age.next) {
      node.age.next.age.prev = node.age.prev;
    } else {
      this.ageTail = node.age.prev;
    }
    if (node.age.prev) {
      node.age.prev.age.next = node.age.next;
    } else {
      this.ageHead = node.age.next;
    }
  }

  private removeNodeFromBucketList(node: CacheNode) {
    if (node.bucket.next) {
      node.bucket.next.bucket.prev = node.bucket.prev;
    }
    if (node.bucket.prev) {
      node.bucket.prev.bucket.next = node.bucket.next;
    } else {
      this.buckets[node.bucketIdx] = node.bucket.next;
    }
  }

  private addNodeToTopOfAgeList(node: CacheNode) {
    node.age.prev = null;
    node.age.next = this.ageHead;
    this.ageHead = node;
    if (node.age.next) {
      node.age.next.age.prev = node;
    }
    if (!this.ageTail) {
      this.ageTail = node;
    }
  }

  private releaseNode(node: CacheNode) {
    this.removeNodeFromBucketList(node);
    this.removeNodeFromAgeList(node);
    this.used--;
    return node;
  }

  private addNodeToTopOfBucketList(node: CacheNode) {
    node.bucket.prev = null;
    node.bucket.next = this.buckets[node.bucketIdx] || null;
    if (node.bucket.next) {
      node.bucket.next.bucket.prev = node;
    }
    this.buckets[node.bucketIdx] = node;
  }

  private releaseOldNodes(now: number) {
    let oldNode = this.ageTail;
    const expiry = now - this.maxCacheTime;
    while (oldNode) {
      if (oldNode.lastUsed > expiry) {
        break;
      }
      this.releaseNode(oldNode);
      oldNode = this.ageTail;
    }
  }

  private findNode(key: string, bucketIdx: number) {
    let node = this.buckets[bucketIdx];
    if (node) {
      do {
        if (node.key == key) {
          return node;
        }
        node = node.bucket.next;
      } while (node);
    }
    return null;
  }

  private moveToAgeHead(node: CacheNode, now: number) {
    if (node !== this.ageHead) {
      this.removeNodeFromAgeList(node);
      this.addNodeToTopOfAgeList(node);
      node.lastUsed = now;
    }
  }

  find(key: string) {
    const bucketIdx = this.hash(key);
    const now = Date.now();
    let data = null;
    const node = this.findNode(key, bucketIdx);
    if (node) {
      this.moveToAgeHead(node, now);
      data = node.data;
    }
    this.releaseOldNodes(now);
    return data;
  }

  private createNode(
    node: CacheNode | null,
    key: string,
    data: any,
    now: number,
    bucketIdx: number
  ) {
    if (node) {
      node.key = key;
      node.lastUsed = now;
      node.bucketIdx = bucketIdx;
      node.data = data;
      node.age = {
        prev: null,
        next: null,
      };
      node.bucket = {
        prev: null,
        next: null,
      };
      return node;
    }
    return {
      key: key,
      lastUsed: now,
      bucketIdx: bucketIdx,
      data: data,
      age: {
        prev: null,
        next: null,
      },
      bucket: {
        prev: null,
        next: null,
      },
    };
  }

  add(key: string, data: any) {
    if (!key) {
      throw Error("The add function requires a key.");
    }
    const now = Date.now();
    const bucketIdx = this.hash(key);
    let node = this.findNode(key, bucketIdx);
    if (node) {
      // this key is already cached/update the data.
      node.data = data;
      this.moveToAgeHead(node, now);
      return;
    }

    if (this.used >= this.maxKeys && this.ageTail) {
      node = this.createNode(
        this.releaseNode(this.ageTail),
        key,
        data,
        now,
        bucketIdx
      );
    } else {
      node = this.createNode(null, key, data, now, bucketIdx);
    }
    this.addNodeToTopOfAgeList(node);
    this.addNodeToTopOfBucketList(node);
    this.used++;
  }

  /**************************** testing code below ****************************
   *                                                                          *
   *       The methods below are not intended for use in production.          *
   *       They exist only to make thorough testing possible.                 *
   *                                                                          *
   ****************************************************************************/

  getMaxKeys() {
    return this.maxKeys;
  }

  getMaxCacheTime() {
    return this.maxCacheTime / 1000;
  }

  getUsed() {
    return this.used;
  }

  private validateBucketLists() {
    let count = 0;
    this.buckets.forEach((bucket, bucketIdx) => {
      if (bucket) {
        let node: CacheNode | null = bucket;
        if (node.bucket.prev) {
          throw new Error(
            `The first node in bucket ${bucketIdx} has a prev value.`
          );
        }
        let loopCount = 0;
        while (node && loopCount < 100) {
          count++;
          loopCount++;
          node = node.bucket.next;
        }
        if (node) {
          throw new Error(
            `There appears to be no end to the #${bucketIdx} bucket list.`
          );
        }
      }
    });
    if (count != this.used) {
      throw new Error(
        `The number of nodes in the buckets does not match the number of used nodes\n\ttotal nodes:      ${this.used}\n\tnodes in buckets: ${count}`
      );
    }
  }

  getBuckets() {
    const buckets = this.buckets.map((bucket, bucketIdx) => {
      if (!bucket) {
        return null;
      }
      const bucketList = [];
      let node: CacheNode | null = bucket;
      do {
        bucketList.push({ key: node.key, data: node.data });
        node = node.bucket.next;
      } while (node);
      return bucketList;
    });
    this.validateBucketLists();
    return buckets;
  }

  private countAgeListNodesFromHead(): number {
    let count = 0;
    let node = this.ageHead;
    while (node && count < this.used + 100) {
      count++;
      const next = node.age.next;
      if (next && node.lastUsed < next.lastUsed) {
        throw new Error("The age head list is not in order!!!");
      }
      node = next;
    }
    return count;
  }

  private validateHead() {
    const nodeCount = this.countAgeListNodesFromHead();
    if (nodeCount != this.used) {
      throw new Error(
        `The number of nodes in the age head list does not match the number of used nodes\n
        \ttotal nodes:            ${this.used}\n
        \tnodes in age head list: ${nodeCount}`
      );
    }

    if (this.ageHead) {
      if (this.used == 0) {
        return {
          expected: "the head should have no value when 'used' equals 0",
          actual: "the head has a value when 'used' equals 0",
        };
      }

      if (this.ageHead.age.prev) {
        return {
          expected: "head.prev is null",
          actual: "head.prev has a value",
        };
      }

      if (this.used == 1) {
        if (this.ageHead.age.next) {
          return {
            expected: "head.next is null when 'used' equals 1",
            actual: "head next has a value",
          };
        }
      }
      if (this.used > 1) {
        if (!this.ageHead.age.next) {
          return {
            expected: "head.next has a value when 'used' is greater than 1",
            actual: "head next is null",
          };
        }
      }
    }
  }

  getHead() {
    this.validateHead();
    if (!this.ageHead) {
      return null;
    }
    return { key: this.ageHead.key, data: this.ageHead.data };
  }

  private countAgeListNodesFromTail() {
    let count = 0;
    let node = this.ageTail;
    while (node && count < this.used + 100) {
      count++;
      const prev = node.age.prev;
      if (prev && node.lastUsed > prev.lastUsed) {
        throw new Error("The age tail list is not in order!!!");
      }
      node = prev;
    }
    return count;
  }

  private validateTail() {
    const nodeCount = this.countAgeListNodesFromTail();
    if (nodeCount != this.used) {
      throw new Error(
        `The number of nodes in the age tail list does not match the number of used nodes\n
        \ttotal nodes:            ${this.used}\n
        \tnodes in age tail list: ${nodeCount}`
      );
    }

    if (this.ageTail) {
      if (this.used == 0) {
        return {
          expected: "the tail should have no value when 'used' equals 0",
          actual: "the tail has a value when 'used' equals 0",
        };
      }

      if (this.ageTail.age.next) {
        return {
          expected: "tail.next is null",
          actual: "tail.next has a value",
        };
      }

      if (this.used == 1) {
        if (this.ageTail.age.prev) {
          return {
            expected: "tail.prev is null when 'used' equals 1",
            actual: "tail.prev has a value",
          };
        }
      }
      if (this.used > 1) {
        if (!this.ageTail.age.prev) {
          return {
            expected: "tail.prev has a value when 'used' is greater than 1",
            actual: "tail.prev is null",
          };
        }
      }
    }
  }

  getTail() {
    this.validateTail();
    if (!this.ageTail) {
      return null;
    }
    return { key: this.ageTail.key, data: this.ageTail.data };
  }
}

export default LMCache;
