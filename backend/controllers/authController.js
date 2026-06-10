const jwt = require('jsonwebtoken');
const db = require('../db/connection');
const otpService = require('../services/otpService');

const JWT_SECRET = process.env.JWT_SECRET || 'bkads_secret_key_jwt_session_secure_2026';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year cookie matching PHP cookie expiry
};

// Password comparison helper
function verifyPassword(inputPassword, dbPassword) {
  // Maintaining PHP compatibility: the PHP code uses straight string comparisons
  return inputPassword === dbPassword;
}

// User: Send OTP
exports.sendOtp = async (req, res) => {
  const { first_name, last_name, mobile, password, confirm_password } = req.body;

  if (!first_name || !mobile || !password || !confirm_password) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }

  if (!/^[A-Za-z\s]{2,}$/.test(first_name)) {
    return res.status(400).json({ error: "First name should contain only letters (minimum 2 characters)." });
  }

  if (last_name && !/^[A-Za-z\s]{1,}$/.test(last_name)) {
    return res.status(400).json({ error: "Last name should contain only letters." });
  }

  if (!/^[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ error: "Password and Confirm Password do not match." });
  }

  try {
    // Check if mobile already exists in profile
    const [existingProfiles] = await db.query("SELECT profile_id FROM profile WHERE mobile = ?", [mobile]);
    if (existingProfiles.length > 0) {
      return res.status(400).json({ error: "Mobile number already registered." });
    }

    // Check OTP count in last hour (max 4 per hour)
    const [otpCountRows] = await db.query(
      `SELECT COUNT(*) as count FROM otp_logs 
       WHERE phone = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR) AND otp IS NOT NULL`,
      [mobile]
    );

    const otpCount = otpCountRows[0].count;
    if (otpCount >= 4) {
      // Log failure row with NULL otp as done in PHP
      const [nullCountRows] = await db.query(
        `SELECT COUNT(*) as count FROM otp_logs 
         WHERE phone = ? AND otp IS NULL AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
        [mobile]
      );
      if (nullCountRows[0].count === 0) {
        await db.query("INSERT INTO otp_logs (phone, otp, created_at) VALUES (?, NULL, NOW())", [mobile]);
      }
      return res.status(429).json({ error: "You have reached the maximum OTP requests (4 per hour). Please try again after 1 hour." });
    }

    // Generate and Send OTP
    const otp = await otpService.generateOTP(mobile);

    // Send WhatsApp OTP
    await otpService.sendWhatsAppOtp(mobile, otp);

    // Insert or update OTP in otp_logs
    const [nullRow] = await db.query("SELECT id FROM otp_logs WHERE phone = ? AND otp IS NULL LIMIT 1", [mobile]);
    if (nullRow.length > 0) {
      await db.query("UPDATE otp_logs SET otp = ?, created_at = NOW() WHERE id = ?", [otp, nullRow[0].id]);
    } else {
      await db.query("INSERT INTO otp_logs (phone, otp, created_at) VALUES (?, ?, NOW())", [mobile, otp]);
    }

    // Log the message status in logs
    console.log(`OTP ${otp} sent to ${mobile}`);

    return res.json({ success: true, message: "OTP sent to your WhatsApp number." });
  } catch (error) {
    console.error("sendOtp error:", error);
    return res.status(500).json({ error: error.message || "Internal server error." });
  }
};

// User: Verify OTP
exports.verifyOtp = async (req, res) => {
  const { mobile, otp, first_name, last_name, password } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ error: "Mobile and OTP are required." });
  }

  try {
    const isValid = await otpService.verifyOTP(mobile, otp);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid or expired OTP. Please try again." });
    }

    // Sign a temporary registration token so the user can complete profile in form.php equivalent
    const regToken = jwt.sign(
      { first_name, last_name, mobile, password, signupVerified: true },
      JWT_SECRET,
      { expiresIn: '30m' } // 30 minutes to complete profile creation
    );

    res.cookie('signup_verified_token', regToken, {
      ...COOKIE_OPTIONS,
      maxAge: 30 * 60 * 1000 // 30 minutes
    });

    return res.json({ success: true, message: "OTP verified successfully. Proceed to profile creation." });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// User: Login
exports.login = async (req, res) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res.status(400).json({ error: "Please enter both mobile number and password." });
  }

  try {
    const [rows] = await db.query(
      "SELECT profile_id, first_name, last_name, mobile, password FROM profile WHERE mobile = ?",
      [mobile]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid mobile number or password." });
    }

    const user = rows[0];
    if (!verifyPassword(password, user.password)) {
      return res.status(400).json({ error: "Invalid mobile number or password." });
    }

    const token = jwt.sign(
      { profile_id: user.profile_id, name: `${user.first_name} ${user.last_name || ''}`.trim(), mobile: user.mobile, role: 'user' },
      JWT_SECRET,
      { expiresIn: '365d' }
    );

    res.cookie('user_token', token, COOKIE_OPTIONS);

    // Also set basic user cookies to mimic PHP ones for compatibility if frontend needs them
    res.cookie('user_id', user.profile_id, COOKIE_OPTIONS);
    res.cookie('user_name', `${user.first_name} ${user.last_name || ''}`.trim(), COOKIE_OPTIONS);
    res.cookie('mobile', user.mobile, COOKIE_OPTIONS);

    return res.json({
      success: true,
      user: {
        profile_id: user.profile_id,
        name: `${user.first_name} ${user.last_name || ''}`.trim(),
        mobile: user.mobile
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// User: Logout
exports.logout = (req, res) => {
  res.clearCookie('user_token');
  res.clearCookie('user_id');
  res.clearCookie('user_name');
  res.clearCookie('mobile');
  res.clearCookie('signup_verified_token');
  return res.json({ success: true, message: "Logged out successfully." });
};

// User: Get Current Session
exports.me = (req, res) => {
  const token = req.cookies.user_token;
  if (!token) {
    return res.status(401).json({ isAuthenticated: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({
      isAuthenticated: true,
      user: {
        profile_id: decoded.profile_id,
        name: decoded.name,
        mobile: decoded.mobile
      }
    });
  } catch (error) {
    return res.status(401).json({ isAuthenticated: false });
  }
};

// Admin: Login
exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Please enter both username and password." });
  }

  try {
    const [rows] = await db.query(
      "SELECT id, username, password, status FROM admin_users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const admin = rows[0];
    if (admin.status !== 'active') {
      return res.status(403).json({ error: "Your account is inactive." });
    }

    if (!verifyPassword(password, admin.password)) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('admin_token', token, {
      ...COOKIE_OPTIONS,
      maxAge: 24 * 60 * 60 * 1000 // 1 day for admin session
    });

    return res.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error("Admin Login error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// Admin: Logout
exports.adminLogout = (req, res) => {
  res.clearCookie('admin_token');
  return res.json({ success: true, message: "Admin logged out successfully." });
};

// Admin: Get Current Session
exports.adminMe = (req, res) => {
  const token = req.cookies.admin_token;
  if (!token) {
    return res.status(401).json({ isAuthenticated: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(401).json({ isAuthenticated: false });
    }
    return res.json({
      isAuthenticated: true,
      admin: {
        id: decoded.id,
        username: decoded.username
      }
    });
  } catch (error) {
    return res.status(401).json({ isAuthenticated: false });
  }
};

// User: Forgot Password Send OTP
exports.forgotPasswordSendOtp = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ error: "Please enter your mobile number." });
  }

  if (!/^[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
  }

  try {
    // Check if mobile exists in profile
    const [existingProfiles] = await db.query("SELECT profile_id FROM profile WHERE mobile = ?", [mobile]);
    if (existingProfiles.length === 0) {
      return res.status(400).json({ error: "Mobile number not found in our records." });
    }

    // Check OTP count in last hour (max 4 per hour)
    const [otpCountRows] = await db.query(
      `SELECT COUNT(*) as count FROM otp_logs 
       WHERE phone = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR) AND otp IS NOT NULL`,
      [mobile]
    );

    const otpCount = otpCountRows[0].count;
    if (otpCount >= 4) {
      // Log failure row with NULL otp as done in PHP
      const [nullCountRows] = await db.query(
        `SELECT COUNT(*) as count FROM otp_logs 
         WHERE phone = ? AND otp IS NULL AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
        [mobile]
      );
      if (nullCountRows[0].count === 0) {
        await db.query("INSERT INTO otp_logs (phone, otp, created_at) VALUES (?, NULL, NOW())", [mobile]);
      }
      return res.status(429).json({ error: "You have reached the maximum OTP requests (4 per hour). Please try again after 1 hour." });
    }

    // Generate and Send OTP
    const otp = await otpService.generateOTP(mobile);

    // Send WhatsApp OTP (reset prefix)
    await otpService.sendWhatsAppOtp(mobile, otp);

    // Insert or update OTP in otp_logs
    const [nullRow] = await db.query("SELECT id FROM otp_logs WHERE phone = ? AND otp IS NULL LIMIT 1", [mobile]);
    if (nullRow.length > 0) {
      await db.query("UPDATE otp_logs SET otp = ?, created_at = NOW() WHERE id = ?", [otp, nullRow[0].id]);
    } else {
      await db.query("INSERT INTO otp_logs (phone, otp, created_at) VALUES (?, ?, NOW())", [mobile, otp]);
    }

    return res.json({ success: true, message: "OTP sent to your WhatsApp number." });
  } catch (error) {
    console.error("forgotPasswordSendOtp error:", error);
    return res.status(500).json({ error: error.message || "Internal server error." });
  }
};

// User: Forgot Password Verify OTP
exports.forgotPasswordVerifyOtp = async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ error: "Mobile and OTP are required." });
  }

  try {
    const isValid = await otpService.verifyOTP(mobile, otp);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid or expired OTP. Please try again." });
    }

    // Sign temporary reset verification token
    const resetToken = jwt.sign(
      { mobile, resetVerified: true },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.cookie('reset_verified_token', resetToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    return res.json({ success: true, message: "OTP verified. Set your new password." });
  } catch (error) {
    console.error("forgotPasswordVerifyOtp error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// User: Forgot Password Reset
exports.forgotPasswordReset = async (req, res) => {
  const { mobile, password, confirm_password } = req.body;
  const resetToken = req.cookies.reset_verified_token;

  if (!resetToken) {
    return res.status(400).json({ error: "Session expired. Please request OTP again." });
  }

  if (!password || !confirm_password) {
    return res.status(400).json({ error: "Please enter and confirm your new password." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  try {
    const decoded = jwt.verify(resetToken, JWT_SECRET);
    if (!decoded.resetVerified || decoded.mobile !== mobile) {
      return res.status(400).json({ error: "Invalid reset session." });
    }

    // Update password in DB
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.query("UPDATE profile SET password = ?, updated_at = ? WHERE mobile = ?", [password, timestamp, mobile]);

    // Clear reset verified cookie
    res.clearCookie('reset_verified_token');

    return res.json({ success: true, message: "Password reset successfully. You can now login." });
  } catch (error) {
    console.error("forgotPasswordReset error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
