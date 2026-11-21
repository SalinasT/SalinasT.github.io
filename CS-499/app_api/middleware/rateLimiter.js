const createRateLimiter = ({ windowMs = 15 * 60 * 1000, maxRequests = 5 } = {}) => {

    const requestLogs = new Map();

    const cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [ip, timestamps] of requestLogs.entries()) {
            const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
            if (validTimestamps.length === 0) {
                requestLogs.delete(ip);
            } else {
                requestLogs.set(ip, validTimestamps);
            }
        }
    }, windowMs);

    cleanupInterval.unref();

    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        const timestamps = requestLogs.get(ip) || [];

        const validTimestamps = timestamps.filter(ts => now - ts < windowMs);

        if (validTimestamps.length >= maxRequests) {
            const retryAfterSec = Math.ceil((validTimestamps[0] + windowMs - now) / 1000);
            res.set('Retry-After', String(retryAfterSec));

            return res.status(429).json({
                message: `Too many requests. Please try again in ${retryAfterSec} seconds.`
            });
        }

        validTimestamps.push(now);
        requestLogs.set(ip, validTimestamps);

        next();
    };
};

module.exports = createRateLimiter;