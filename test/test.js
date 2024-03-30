import {describe, it, before, beforeEach} from 'node:test';
import assert from 'node:assert';
import {LMCache as Cache} from "../build/cache.js";

const KEY_0 = "key0"; // NEVER ADD THIS KEY. It needs to be a guarantee miss
const DATA_0 = "data0";

const KEY_1 = "key1";
const DATA_1 = "data1";

const KEY_2 = "key2";
const DATA_2 = "data2";

const KEY_3 = "key3";
const DATA_3 = "data3";

const KEY_4 = "key4";
const DATA_4 = "data4";

const KEY_5 = "key5";
const DATA_5 = "data5";

const KEY_6 = "key6";
const DATA_6 = "data6";

const KEY_7 = "key7";
const DATA_7 = "data7";

const KEY_8 = "key8";
const DATA_8 = "data8";

const KEY_9 = "key9";
const DATA_9 = "data9";

const KEY_10 = "key10";
const DATA_10 = "data10";

const KEY_11 = "key11";
const DATA_11 = "data11";

const KEY_12 = "key12";
const DATA_12 = "data12";

const KEY_13 = "key13";
const DATA_13 = "data13";

const KEY_14 = "key14";
const DATA_14 = "data14";

const KEY_15 = "key15";
const DATA_15 = "data15";

const KEY_16 = "key16";
const DATA_16 = "data16";

const stripProperty = (list, prop) => {
  list.forEach((obj) => {
    if (obj && obj[prop]) {
      delete obj[prop];
    }
  });
};

const str = (obj) => {
  return JSON.stringify(obj);
};

describe("constructor", function () {
  describe("when called with no arguments", function () {
    before(function () {});
    it("should have a functional empty cache of default size", function () {
      const cache = new Cache();
      assert.equal(100, cache.getMaxKeys());
      assert.equal(60 * 5, cache.getMaxCacheTime());
      assert.equal(0, cache.getUsed());
    });
  });
  describe("when called with arguments", function () {
    before(function () {});
    it("should have a functional empty cache of default size", function () {
      const cache = new Cache(75, 20 * 60);
      assert.equal(75, cache.getMaxKeys());
      assert.equal(20 * 60, cache.getMaxCacheTime());
      assert.equal(0, cache.getUsed());
    });
  });
  describe("when called with one argument", function () {
    before(function () {});
    it("should have a functional empty cache of default size", function () {
      const cache = new Cache(75);
      assert.equal(75, cache.getMaxKeys());
      assert.equal(5 * 60, cache.getMaxCacheTime());
      assert.equal(0, cache.getUsed());
    });
  });
});
describe("find", function () {
    let cache;
  before(function () {
    cache = new Cache();
  });
  describe("when the key is not found in the cache", function () {
    it("should return null", function () {
      assert.equal(null, cache.find(KEY_0));
    });
  });

  before(function () {
    cache = new Cache();
    cache.add(KEY_1, DATA_1);
  });
  describe("when the key is found in the cache", function () {
    it("should return the data added with the key", function () {
      assert.equal(DATA_1, cache.find(KEY_1));
    });
  });
});
describe("add", function () {
  let cache;
  before(function () {
    cache = new Cache();
  });
  describe("when a null key is passed in", function () {
    let cache;
    it("should throw an exception", function () {
      assert.throws(
        () => {
          cache.add(null, {});
        },
        Error,
        "The add function requires a key."
      );
    });
  });

  before(function () {
    cache = new Cache();
  });

  describe("when a valid key is added", function () {
    it("should return the corresponding data when that key is passed to find.", function () {
      cache.add(KEY_1, DATA_1);
      assert.equal(DATA_1, cache.find(KEY_1));
    });
  });

  before(function () {
    cache = new Cache();
  });

  describe("when a cached key is added again", function () {
    it("should overwrite the cached data", function () {
      cache.add(KEY_1, DATA_1);
      assert.equal(DATA_1, cache.find(KEY_1));
      cache.add(KEY_1, "New Data");
      assert.equal("New Data", cache.find(KEY_1));
      assert.equal(1, cache.getUsed());
      assert.equal(str({ key: KEY_1, data: "New Data" }), str(cache.getHead()));
      assert.equal(str({ key: KEY_1, data: "New Data" }), str(cache.getTail()));
    });
  });
});

describe("validate cache integrity", function () {
  describe("when depth is one", function () {
    const validateFirstAdd = (theCache) => {
      assert.equal(
        str([null, [{ key: KEY_1, data: DATA_1 }], null, null, null]),
        str(theCache.getBuckets())
      );
    };

    const validateSecondAdd = (theCache) => {
      assert.equal(
        str([
          null,
          [{ key: KEY_1, data: DATA_1 }],
          [{ key: KEY_2, data: DATA_2 }],
          null,
          null,
        ]),
        str(theCache.getBuckets())
      );
    };

    const validateThirdAdd = (theCache) => {
      assert.equal(
        str([
          null,
          [{ key: KEY_1, data: DATA_1 }],
          [{ key: KEY_2, data: DATA_2 }],
          [{ key: KEY_3, data: DATA_3 }],
          null,
        ]),
        str(theCache.getBuckets())
      );
    };

    const validateFourthAdd = (theCache) => {
      assert.equal(
        str([
          undefined,
          [{ key: KEY_1, data: DATA_1 }],
          [{ key: KEY_2, data: DATA_2 }],
          [{ key: KEY_3, data: DATA_3 }],
          [{ key: KEY_4, data: DATA_4 }],
        ]),
        str(theCache.getBuckets())
      );
    };

    const validateFifthAdd = (theCache) => {
      assert.equal(
        str([
          [{ key: KEY_5, data: DATA_5 }],
          [{ key: KEY_1, data: DATA_1 }],
          [{ key: KEY_2, data: DATA_2 }],
          [{ key: KEY_3, data: DATA_3 }],
          [{ key: KEY_4, data: DATA_4 }],
        ]),
        str(theCache.getBuckets())
      );
    };

    const validateSixthAdd = (theCache) => {
      assert.equal(
        str([
          [{ key: KEY_5, data: DATA_5 }],
          [{ key: KEY_6, data: DATA_6 }],
          [{ key: KEY_2, data: DATA_2 }],
          [{ key: KEY_3, data: DATA_3 }],
          [{ key: KEY_4, data: DATA_4 }],
        ]),
        str(theCache.getBuckets())
      );
    };

    describe("when the cache is empty", function () {
      let cache;
      before(function () {
        cache = new Cache(5);
      });

      describe("when the first key is added", function () {
        it("should create a node and add it at the top of age list and at the beginning of its bucket list.", function () {
          cache.add(KEY_1, DATA_1);
          validateFirstAdd(cache);
          assert.equal(str({ key: KEY_1, data: DATA_1 }), str(cache.getHead()));
          assert.equal(str({ key: KEY_1, data: DATA_1 }), str(cache.getTail()));
        });
      });
    });

    describe("when the cache has one entry", function () {
      let cache;
      before(function () {
        cache = new Cache(5);
        cache.add(KEY_1, DATA_1);
        validateFirstAdd(cache);
      });
      describe("when find is called with a matching key", function () {
        it("should return the data associated with the key", function () {
          assert.equal(DATA_1, cache.find(KEY_1));
        });
      });

      describe("when find is called with a non-matching key", function () {
        it("should return null", function () {
          assert.equal(null, cache.find(KEY_0));
        });
      });

      describe("when a second key is added", function () {
        it("should create a node and add it at the top of age list and at the beginning of its bucket list.", function () {
          cache.add(KEY_2, DATA_2);
          validateSecondAdd(cache);
          assert.equal(str({ key: KEY_2, data: DATA_2 }), str(cache.getHead()));
          assert.equal(str({ key: KEY_1, data: DATA_1 }), str(cache.getTail()));
        });
      });
    });

    describe("when the cache has two entries", function () {
      let cache;
      beforeEach(function () {
        cache = new Cache(5);
        cache.add(KEY_1, DATA_1);
        validateFirstAdd(cache);
        cache.add(KEY_2, DATA_2);
        validateSecondAdd(cache);
      });
      describe("when find is called with the first key", function () {
        it("the corresponding data should be returned and the node should be moved to the head.", function () {
          assert.equal(str({ key: KEY_2, data: DATA_2 }), str(cache.getHead()));
          assert.equal(str({ key: KEY_1, data: DATA_1 }), str(cache.getTail()));
          assert.equal(DATA_1, cache.find(KEY_1));
          assert.equal(str({ key: KEY_1, data: DATA_1 }), str(cache.getHead()));
          assert.equal(str({ key: KEY_2, data: DATA_2 }), str(cache.getTail()));
        });
      });

      describe("when find is called with a non-matching key", function () {
        it("should return null", function () {
          assert.equal(null, cache.find(KEY_0));
        });
      });

      describe("when a third key is added", function () {
        it("should create a node and add it at the top of age list and at the beginning of its bucket list.", function () {
          cache.add(KEY_3, DATA_3);
          validateThirdAdd(cache);
          assert.equal(str({ key: KEY_3, data: DATA_3 }), str(cache.getHead()));
          assert.equal(str({ key: KEY_1, data: DATA_1 }), str(cache.getTail()));
        });
      });
    });

    describe("when the cache has three entries", function () {
      let cache;
      beforeEach(function () {
        cache = new Cache(5);
        cache.add(KEY_1, DATA_1);
        validateFirstAdd(cache);
        cache.add(KEY_2, DATA_2);
        validateSecondAdd(cache);
        cache.add(KEY_3, DATA_3);
        validateThirdAdd(cache);
      });
      describe("when find is called with the first key", function () {
        it("the corresponding data should be returned and the node should be moved to the head.", function () {
          assert.equal(str({ key: KEY_3, data: DATA_3 }), str(cache.getHead()));
          assert.equal(str({ key: KEY_1, data: DATA_1 }), str(cache.getTail()));
          assert.equal(DATA_2, cache.find(KEY_2));
          assert.equal(str({ key: KEY_2, data: DATA_2 }), str(cache.getHead()));
          assert.equal(str({ key: KEY_1, data: DATA_1 }), str(cache.getTail()));
        });
      });

      describe("when find is called with a non-matching key", function () {
        it("should return null", function () {
          assert.equal(null, cache.find(KEY_0));
        });
      });

      describe("when a fourth key is added", function () {
        it("should create a node and add it at the top of age list and at the beginning of its bucket list.", function () {
          cache.add(KEY_4, DATA_4);
          validateFourthAdd(cache);
          assert.equal(str({ key: KEY_4, data: DATA_4 }), str(cache.getHead()));
          assert.equal(str({ key: KEY_1, data: DATA_1 }), str(cache.getTail()));
        });
      });
    });

    describe("when the cache has cache size minus one entries", function () {
      let cache;
      beforeEach(function () {
        cache = new Cache(5);
        cache.add(KEY_1, DATA_1);
        validateFirstAdd(cache);
        cache.add(KEY_2, DATA_2);
        validateSecondAdd(cache);
        cache.add(KEY_3, DATA_3);
        validateThirdAdd(cache);
        cache.add(KEY_4, DATA_4);
        validateFourthAdd(cache);
      });
      describe("when find is called with the first key", function () {
        it("the corresponding data should be returned and the node should be moved to the head.", function () {
          assert.equal(str({ key: KEY_4, data: DATA_4 }), str(cache.getHead()));
          assert.equal(str({ key: KEY_1, data: DATA_1 }), str(cache.getTail()));
          assert.equal(DATA_1, cache.find(KEY_1));
          assert.equal(str({ key: KEY_1, data: DATA_1 }), str(cache.getHead()));
          assert.equal(str({ key: KEY_2, data: DATA_2 }), str(cache.getTail()));
        });
      });

      describe("when find is called with a non-matching key", function () {
        it("should return null", function () {
          assert.equal(null, cache.find(KEY_0));
        });
      });

      describe("when a fifth key is added", function () {
        it("should create a node and add it at the top of age list and at the beginning of its bucket list.", function () {
          cache.add(KEY_5, DATA_5);
          validateFifthAdd(cache);
          assert.equal(str({ key: KEY_5, data: DATA_5 }), str(cache.getHead()));
          assert.equal(str({ key: KEY_1, data: DATA_1 }), str(cache.getTail()));
        });
      });
    });

    describe("when the cache has cache size entries", function () {
      let cache;
      beforeEach(function () {
        cache = new Cache(5);
        cache.add(KEY_1, DATA_1);
        validateFirstAdd(cache);
        cache.add(KEY_2, DATA_2);
        validateSecondAdd(cache);
        cache.add(KEY_3, DATA_3);
        validateThirdAdd(cache);
        cache.add(KEY_4, DATA_4);
        validateFourthAdd(cache);
        cache.add(KEY_5, DATA_5);
        validateFifthAdd(cache);
      });

      describe("when find is called with the same key", function () {
        it("the corresponding data should be returned and the node should not be moved.", function () {
          assert.equal(str({ key: KEY_5, data: DATA_5 }), str(cache.getHead()));
          assert.equal(str({ key: KEY_1, data: DATA_1 }), str(cache.getTail()));
          assert.equal(DATA_5, cache.find(KEY_5));
          assert.equal(str({ key: KEY_5, data: DATA_5 }), str(cache.getHead()));
          assert.equal(str({ key: KEY_1, data: DATA_1 }), str(cache.getTail()));
        });
      });

      describe("when find is called with the second key", function () {
        it("the corresponding data should be returned and the node should be moved to the head.", function () {
          assert.equal(str({ key: KEY_5, data: DATA_5 }), str(cache.getHead()));
          assert.equal(str({ key: KEY_1, data: DATA_1 }), str(cache.getTail()));
          assert.equal(DATA_2, cache.find(KEY_2));
          assert.equal(str({ key: KEY_2, data: DATA_2 }), str(cache.getHead()));
          assert.equal(str({ key: KEY_1, data: DATA_1 }), str(cache.getTail()));
        });
      });

      describe("when find is called with a non-matching key", function () {
        it("should return null", function () {
          assert.equal(null, cache.find(KEY_0));
        });
      });

      describe("when a cache size plus one key is added", function () {
        it("should remove the oldest node from its bucket list, replace its contents, move it to the top of age list, and add it to the beginning of the appropriate bucket list.", function () {
          cache.add(KEY_6, DATA_6);
          validateSixthAdd(cache);
          assert.equal(str({ key: KEY_6, data: DATA_6 }), str(cache.getHead()));
          assert.equal(str({ key: KEY_2, data: DATA_2 }), str(cache.getTail()));
        });
      });
    });
  });
  describe("when the cache size is 15", function () {
    describe("and the bucket count is 5", function () {
      let cache;
      const validateFifthteenthAdd = (theCache) => {
        assert.equal(
          str([
            [
              { key: KEY_15, data: DATA_15 },
              { key: KEY_10, data: DATA_10 },
              { key: KEY_5, data: DATA_5 },
            ],
            [
              { key: KEY_11, data: DATA_11 },
              { key: KEY_6, data: DATA_6 },
              { key: KEY_1, data: DATA_1 },
            ],
            [
              { key: KEY_12, data: DATA_12 },
              { key: KEY_7, data: DATA_7 },
              { key: KEY_2, data: DATA_2 },
            ],
            [
              { key: KEY_13, data: DATA_13 },
              { key: KEY_8, data: DATA_8 },
              { key: KEY_3, data: DATA_3 },
            ],
            [
              { key: KEY_14, data: DATA_14 },
              { key: KEY_9, data: DATA_9 },
              { key: KEY_4, data: DATA_4 },
            ],
          ]),
          str(theCache.getBuckets())
        );
      };

      const validateSixteenthAdd = (theCache) => {
        assert.equal(
          str([
            [
              { key: KEY_15, data: DATA_15 },
              { key: KEY_10, data: DATA_10 },
              { key: KEY_5, data: DATA_5 },
            ],
            [
              { key: KEY_16, data: DATA_16 },
              { key: KEY_11, data: DATA_11 },
              { key: KEY_6, data: DATA_6 },
            ],
            [
              { key: KEY_12, data: DATA_12 },
              { key: KEY_7, data: DATA_7 },
              { key: KEY_2, data: DATA_2 },
            ],
            [
              { key: KEY_13, data: DATA_13 },
              { key: KEY_8, data: DATA_8 },
              { key: KEY_3, data: DATA_3 },
            ],
            [
              { key: KEY_14, data: DATA_14 },
              { key: KEY_9, data: DATA_9 },
              { key: KEY_4, data: DATA_4 },
            ],
          ]),
          str(theCache.getBuckets())
        );
      };

      describe("when 15 unique keys are added", function () {
        before(function () {
          cache = new Cache(15, 10 * 60, 3);
          cache.add(KEY_1, DATA_1);
          cache.add(KEY_2, DATA_2);
          cache.add(KEY_3, DATA_3);
          cache.add(KEY_4, DATA_4);
          cache.add(KEY_5, DATA_5);
          cache.add(KEY_6, DATA_6);
          cache.add(KEY_7, DATA_7);
          cache.add(KEY_8, DATA_8);
          cache.add(KEY_9, DATA_9);
          cache.add(KEY_10, DATA_10);
          cache.add(KEY_11, DATA_11);
          cache.add(KEY_12, DATA_12);
          cache.add(KEY_13, DATA_13);
          cache.add(KEY_14, DATA_14);
          cache.add(KEY_15, DATA_15);
        });
        it("should cache all 15 keys", function () {
          validateFifthteenthAdd(cache);
          assert.equal(
            str({ key: KEY_15, data: DATA_15 }),
            str(cache.getHead())
          );
          assert.equal(str({ key: KEY_1, data: DATA_1 }), str(cache.getTail()));
        });
      });

      describe("when a 16th keys is added", function () {
        before(function () {
          cache = new Cache(15, 10 * 60, 3);
          cache.add(KEY_1, DATA_1);
          cache.add(KEY_2, DATA_2);
          cache.add(KEY_3, DATA_3);
          cache.add(KEY_4, DATA_4);
          cache.add(KEY_5, DATA_5);
          cache.add(KEY_6, DATA_6);
          cache.add(KEY_7, DATA_7);
          cache.add(KEY_8, DATA_8);
          cache.add(KEY_9, DATA_9);
          cache.add(KEY_10, DATA_10);
          cache.add(KEY_11, DATA_11);
          cache.add(KEY_12, DATA_12);
          cache.add(KEY_13, DATA_13);
          cache.add(KEY_14, DATA_14);
          cache.add(KEY_15, DATA_15);
          validateFifthteenthAdd(cache);
        });
        it("should remove the oldest node from its bucket list, replace its contents, move it to the top of age list, and add it to the beginning of the appropriate bucket list.", function () {
          cache.add(KEY_16, DATA_16);
          validateSixteenthAdd(cache);
          assert.equal(
            str({ key: KEY_16, data: DATA_16 }),
            str(cache.getHead())
          );
          assert.equal(str({ key: KEY_2, data: DATA_2 }), str(cache.getTail()));
        });
      });

      describe("when find is called on any key", function () {
        before(function () {
          cache = new Cache(15, 10 * 60, 3);
          cache.add(KEY_1, DATA_1);
          cache.add(KEY_2, DATA_2);
          cache.add(KEY_3, DATA_3);
          cache.add(KEY_4, DATA_4);
          cache.add(KEY_5, DATA_5);
          cache.add(KEY_6, DATA_6);
          cache.add(KEY_7, DATA_7);
          cache.add(KEY_8, DATA_8);
          cache.add(KEY_9, DATA_9);
          cache.add(KEY_10, DATA_10);
          cache.add(KEY_11, DATA_11);
          cache.add(KEY_12, DATA_12);
          cache.add(KEY_13, DATA_13);
          cache.add(KEY_14, DATA_14);
          cache.add(KEY_15, DATA_15);
          cache.add(KEY_16, DATA_16);
          validateSixteenthAdd(cache);
        });
        it("should return the associated value if cached.", function () {
          assert.equal(
            str({ key: KEY_16, data: DATA_16 }),
            str(cache.getHead())
          );
          assert.equal(str({ key: KEY_2, data: DATA_2 }), str(cache.getTail()));

          assert.equal(DATA_11, cache.find(KEY_11));

          assert.equal(
            str({ key: KEY_11, data: DATA_11 }),
            str(cache.getHead())
          );
          assert.equal(str({ key: KEY_2, data: DATA_2 }), str(cache.getTail()));

          assert.equal(null, cache.find(KEY_1));
        });
      });
    });
  });
});

describe("time based clean up", function () {
  describe("when items in the cache have been untouched longer than max cache time", function () {
    let cache;
    before(async function () {
      cache = new Cache(6, 2);
      cache.add(KEY_1, DATA_1);
      cache.add(KEY_2, DATA_2);
      cache.add(KEY_3, DATA_3);
      cache.add(KEY_4, DATA_4);
      cache.add(KEY_5, DATA_5);
      await new Promise((resolve, reject) => {
        setTimeout(function () {
          resolve();
        }, 1000);
      });
    });
    it("should remove the untouched items.", async function () {
      assert.equal(
        str([
          [{ key: "key1", data: "data1" }],
          [{ key: "key2", data: "data2" }],
          [{ key: "key3", data: "data3" }],
          [{ key: "key4", data: "data4" }],
          [{ key: "key5", data: "data5" }],
          null,
        ]),
        str(cache.getBuckets())
      );
      assert.equal(str({ key: "key5", data: "data5" }), str(cache.getHead()));
      assert.equal(str({ key: "key1", data: "data1" }), str(cache.getTail()));

      assert.equal(DATA_4, cache.find(KEY_4));
      cache.add(KEY_6, DATA_6);
      assert.equal(DATA_2, cache.find(KEY_2));
      assert.equal(
        str([
          [{ key: "key1", data: "data1" }],
          [{ key: "key2", data: "data2" }],
          [{ key: "key3", data: "data3" }],
          [{ key: "key4", data: "data4" }],
          [{ key: "key5", data: "data5" }],
          [{ key: "key6", data: "data6" }],
        ]),
        str(cache.getBuckets())
      );
      assert.equal(str({ key: "key2", data: "data2" }), str(cache.getHead()));
      assert.equal(str({ key: "key1", data: "data1" }), str(cache.getTail()));

      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, 1500);
      });
      cache.find(KEY_0);
      assert.equal(
        str([
          null,
          [{ key: "key2", data: "data2" }],
          null,
          [{ key: "key4", data: "data4" }],
          null,
          [{ key: "key6", data: "data6" }],
        ]),
        str(cache.getBuckets())
      );
      assert.equal(str({ key: "key2", data: "data2" }), str(cache.getHead()));
      assert.equal(str({ key: "key4", data: "data4" }), str(cache.getTail()));
      assert.equal(3, cache.getUsed());
    });
  });
});
