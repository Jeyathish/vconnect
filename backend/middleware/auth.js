const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'bkads_secret_key_jwt_session_secure_2026';

const verifyUser = (req, res, next) => {
  const token = req.cookies.user_token;
  if (!token) {
    return res.status(401).json({ error: "Access denied. Please login." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie('user_token');
    return res.status(401).json({ error: "Session expired. Please login again." });
  }
};

const verifyAdmin = (req, res, next) => {
  const token = req.cookies.admin_token;
  if (!token) {
    return res.status(401).json({ error: "Access denied. Admin access required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden. Admin access required." });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    res.clearCookie('admin_token');
    return res.status(401).json({ error: "Admin session expired. Please login again." });
  }
};

const verifyAny = (req, res, next) => {
  const userToken = req.cookies.user_token;
  const adminToken = req.cookies.admin_token;

  if (!userToken && !adminToken) {
    return res.status(401).json({ error: "Access denied. Authorization required." });
  }

  try {
    if (adminToken) {
      const decodedAdmin = jwt.verify(adminToken, JWT_SECRET);
      if (decodedAdmin.role === 'admin') {
        req.admin = decodedAdmin;
        req.user = { profile_id: null, role: 'admin' };
        return next();
      }
    }

    if (userToken) {
      const decodedUser = jwt.verify(userToken, JWT_SECRET);
      req.user = decodedUser;
      return next();
    }
  } catch (e) {
    // Continue to error return
  }

  return res.status(401).json({ error: "Session invalid or expired." });
};

module.exports = {
  verifyUser,
  verifyAdmin,
  verifyAny
};
