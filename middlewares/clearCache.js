const { clearHash } = require('../services/cache');

const clearCacheMiddleware = (hashResolver) => async (req, res, next) => {
    await next();
    clearHash(hashResolver(req));
};

module.exports = clearCacheMiddleware;