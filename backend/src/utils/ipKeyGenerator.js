/**
 * IPv6-safe IP key generator for express-rate-limit
 * Extracts the client IP address safely, handling both IPv4 and IPv6
 */
function ipKeyGenerator(req) {
  // Priority order for IP extraction:
  // 1. X-Forwarded-For (for proxies)
  // 2. CF-Connecting-IP (for Cloudflare)
  // 3. req.ip (Express with trust proxy)
  // 4. req.connection.remoteAddress (fallback)

  let ip = req.headers['x-forwarded-for'];
  
  if (ip) {
    // x-forwarded-for can be a comma-separated list
    ip = ip.split(',')[0].trim();
  } else if (req.headers['cf-connecting-ip']) {
    ip = req.headers['cf-connecting-ip'];
  } else if (req.ip) {
    ip = req.ip;
  } else {
    ip = req.connection.remoteAddress;
  }

  // Remove IPv6 prefix if present (::ffff:192.168.1.1)
  if (ip && ip.includes('::ffff:')) {
    ip = ip.replace(/^::ffff:/, '');
  }

  return ip || 'unknown';
}

module.exports = {
  ipKeyGenerator,
};
