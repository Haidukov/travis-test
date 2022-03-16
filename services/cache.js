const redis = require('redis');
const util = require('util');
const mongoose = require('mongoose');
const keys = require('../config/keys');

const redisUrl = keys.redisUrl;
const redisClient = redis.createClient(redisUrl);

const redisHGet = util.promisify(redisClient.hget).bind(redisClient);
const redisHSet = util.promisify(redisClient.hset).bind(redisClient);
const redisDel = util.promisify(redisClient.del).bind(redisClient);

const originalExec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this;
}

mongoose.Query.prototype.exec = async function() {
    const callOriginalMethod = () => originalExec.apply(this, arguments);
    if (!this.useCache) {
        return callOriginalMethod();
    }
    const key = JSON.stringify({
        ...this.getQuery(),
        collection: this.mongooseCollection.name
    });
    const cacheValue = await redisHGet(this.hashKey, key);
    if (cacheValue) {
        const parsedValue = JSON.parse(cacheValue);
        return Array.isArray(parsedValue) ?
            parsedValue.map(item => new this.model(item)) :
            new this.model(parsedValue);
    }
    const result = await callOriginalMethod();
    redisHSet(this.hashKey, key, JSON.stringify(result), 'EX', 10);
    return result;
};

module.exports = {
    clearHash(hashKey) {
        redisDel(JSON.stringify(hashKey));
    }
};