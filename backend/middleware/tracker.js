const axios = require('axios');
const requestIp = require('request-ip');
const db = require('../db/connection');

// Helper to get formatted IST date
function getISTDateTime() {
  const date = new Date();
  // Format as YYYY-MM-DD HH:mm:ss in Asia/Kolkata timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const map = {};
  parts.forEach(p => { map[p.type] = p.value; });
  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
}

function extractBrowser(userAgentStr) {
  const ua = (userAgentStr || 'Unknown').toLowerCase();
  if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('edg')) return 'Edge';
  if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
  if (ua.includes('brave')) return 'Brave';
  return 'Other';
}

function getDeviceInfo(userAgentStr) {
  const ua = userAgentStr || 'Unknown';
  let device = 'Desktop';
  if (ua.includes('Mobile')) {
    device = 'Mobile';
  } else if (ua.includes('Tablet')) {
    device = 'Tablet';
  }
  const browser = extractBrowser(ua);
  return `${device} - ${browser}`;
}

async function getLocationInfo(ip) {
  const defaultData = {
    city: 'Unknown',
    region: 'Unknown',
    country: 'Unknown',
    location: 'Unknown',
    org: 'Unknown'
  };

  if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168') || ip === 'Unknown') {
    return defaultData;
  }

  const services = [
    `http://ip-api.com/json/${ip}`,
    `https://api.ipgeolocation.io/ipgeo?ip=${ip}`, // might need api key, but fallback will catch
    `http://ipapi.co/${ip}/json/`
  ];

  for (const url of services) {
    try {
      const response = await axios.get(url, { timeout: 3000 });
      const data = response.data;
      if (data && (data.city || data.country_name || data.country)) {
        return {
          city: data.city || 'Unknown',
          region: data.regionName || data.region || 'Unknown',
          country: data.country || data.country_name || 'Unknown',
          location: (data.lat && data.lon) ? `${data.lat},${data.lon}` : (data.latitude && data.longitude ? `${data.latitude},${data.longitude}` : 'Unknown'),
          org: data.org || data.isp || 'Unknown'
        };
      }
    } catch (e) {
      // Continue to next service
    }
  }

  return defaultData;
}

const trackVisitor = async (req, res, next) => {
  try {
    // Get IP
    let ip = requestIp.getClientIp(req) || 'Unknown';
    if (ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }
    // Normalize localhost IPv6 to IPv4
    if (ip === '::ffff:127.0.0.1') {
      ip = '127.0.0.1';
    }

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const deviceInfo = getDeviceInfo(userAgent);
    const browser = extractBrowser(userAgent);

    // Check duplicate visit in last 15 minutes
    const browserPattern = `%${browser}%`;
    const [duplicates] = await db.query(
      `SELECT id FROM visitor_logs 
       WHERE ip = ? AND device LIKE ? AND visited_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE) 
       LIMIT 1`,
      [ip, browserPattern]
    );

    if (duplicates.length === 0) {
      const locationData = await getLocationInfo(ip);
      const pageVisited = req.originalUrl || 'Unknown';
      const timestamp = getISTDateTime();

      await db.query(
        `INSERT INTO visitor_logs 
         (ip, city, region, country, location, org, visited_at, device, page_visited, user_agent, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ip,
          locationData.city,
          locationData.region,
          locationData.country,
          locationData.location,
          locationData.org,
          timestamp,
          deviceInfo,
          pageVisited,
          userAgent,
          timestamp
        ]
      );
    }
  } catch (error) {
    console.error("Visitor tracking error:", error);
  }
  
  if (next) next();
};

module.exports = trackVisitor;
