const path = require('path');
const fs = require('fs');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const db = require('../db/connection');
const otpService = require('../services/otpService');

const JWT_SECRET = process.env.JWT_SECRET || 'bkads_secret_key_jwt_session_secure_2026';
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subFolder = 'profiles';
    if (file.fieldname === 'background_img_input') {
      subFolder = 'backgrounds';
    }
    const destDir = path.join(UPLOADS_DIR, subFolder);
    
    // Ensure dir exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    cb(null, destDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

// Configure file type filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and GIF images are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });
exports.uploadMiddleware = upload.fields([
  { name: 'profile_img_input', maxCount: 1 },
  { name: 'background_img_input', maxCount: 1 }
]);

// Helper to format welcome WhatsApp message
async function sendWelcomeWhatsApp(firstName, mobile) {
  const waPhone = mobile.replace(/\D/g, '');
  let formattedPhone = waPhone;
  if (formattedPhone.length === 10 && !formattedPhone.startsWith('91')) {
    formattedPhone = '91' + formattedPhone;
  }

  let waMessage = `Hello ${firstName},\n\n`;
  waMessage += "Thank you for joining VConnect. To Generate the Qr code:\n\n";
  waMessage += "1. Go to home page.\n";
  waMessage += "2. Click the Logo with your first name.\n";
  waMessage += "3. Click on Profile.\n";
  waMessage += "4. Scroll down to 'Digital Business Card' section.\n";
  waMessage += "5. Click the 'Generate QR Code' button.\n";
  waMessage += "6. Your QR Code will be generated.\n";
  waMessage += "7. Download your QR code.\n\n";
  waMessage += "Thank you!";

  const url = process.env.WHATSAPP_API_URL || 'https://wbot.dhanyafamilysaloon.in/send-message';
  const params = new URLSearchParams();
  params.append('phone', formattedPhone);
  params.append('message', waMessage);

  try {
    const response = await axios.post(url, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    // Log response
    const logMsg = `[${new Date().toISOString()}] Profile Welcome (${mobile}) - Response: ${JSON.stringify(response.data)}\n`;
    fs.appendFileSync(path.join(__dirname, '..', 'whatsapp_profile.log'), logMsg);
  } catch (error) {
    console.error("Welcome WhatsApp delivery failed:", error.message);
  }
}

// Get Profile Card (Public or Private)
exports.getProfile = async (req, res) => {
  const profileId = parseInt(req.params.id);
  if (isNaN(profileId)) {
    return res.status(400).json({ error: "Invalid profile ID." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM profile WHERE profile_id = ?", [profileId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Profile not found." });
    }

    const profile = rows[0];

    // Determine ownership
    let isOwner = false;
    const token = req.cookies.user_token;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.mobile === profile.mobile || decoded.role === 'admin') {
          isOwner = true;
        }
      } catch (e) {
        // Invalid token, treat as visitor
      }
    }

    return res.json({ profile, isOwner });
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// Create Profile
exports.createProfile = async (req, res) => {
  const signupToken = req.cookies.signup_verified_token;
  const adminToken = req.cookies.admin_token;

  let first_name, last_name, mobile, password;
  let isAdminCreating = false;

  if (adminToken) {
    try {
      const decodedAdmin = jwt.verify(adminToken, JWT_SECRET);
      if (decodedAdmin.role === 'admin') {
        isAdminCreating = true;
        first_name = req.body.first_name;
        last_name = req.body.last_name;
        mobile = req.body.mobile;
        password = req.body.password;
      }
    } catch (e) {
      return res.status(401).json({ error: "Invalid admin session." });
    }
  }

  if (!isAdminCreating) {
    if (!signupToken) {
      return res.status(400).json({ error: "Signup session expired. Please verify OTP again." });
    }
    try {
      const signupData = jwt.verify(signupToken, JWT_SECRET);
      first_name = signupData.first_name;
      last_name = signupData.last_name;
      mobile = signupData.mobile;
      password = signupData.password;
    } catch (error) {
      return res.status(400).json({ error: "Session expired or invalid signup data." });
    }
  }

  const {
    designation,
    company_name,
    alter_mobile,
    land_line,
    email,
    alter_email,
    website,
    address,
    notes,
    description,
    template
  } = req.body;

  // File paths
  const files = req.files || {};
  let profileImgPath = null;
  let backgroundImgPath = null;

  if (files.profile_img_input && files.profile_img_input[0]) {
    const filename = files.profile_img_input[0].filename;
    profileImgPath = `uploads/profiles/${filename}`;
  } else {
    return res.status(400).json({ error: "Profile image is required" });
  }

  if (files.background_img_input && files.background_img_input[0]) {
    const filename = files.background_img_input[0].filename;
    backgroundImgPath = `uploads/backgrounds/${filename}`;
  } else {
    return res.status(400).json({ error: "Background image is required" });
  }

  // Basic email/alter_mobile validations matching form.php
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.com$/.test(email)) {
    return res.status(400).json({ error: "Email must end with @email.com" });
  }
  if (alter_email && !/^[^\s@]+@[^\s@]+\.com$/.test(alter_email)) {
    return res.status(400).json({ error: "Alternative email must end with @email.com" });
  }
  if (alter_mobile && !/^[0-9]{10}$/.test(alter_mobile)) {
    return res.status(400).json({ error: "Alternative mobile must be exactly 10 digits" });
  }

  const selectedTemplate = ['1', '2', '3', '4', '5', '6'].includes(template) ? template : '1';
  const createdAt = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }); // Format time
  const formattedCreatedAt = new Date(createdAt).toISOString().slice(0, 19).replace('T', ' ');

  try {
    const [result] = await db.query(
      `INSERT INTO profile 
       (first_name, last_name, profile_img, background, template, designation, company_name, mobile, alter_mobile, password, land_line, email, alter_email, website, address, notes, description, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name || null,
        profileImgPath,
        backgroundImgPath,
        selectedTemplate,
        designation || null,
        company_name || null,
        mobile,
        alter_mobile || null,
        password,
        land_line || null,
        email,
        alter_email || null,
        website || null,
        address || null,
        notes || null,
        description || null,
        formattedCreatedAt,
        formattedCreatedAt
      ]
    );

    const profileId = result.insertId;

    // Send WhatsApp notification
    await sendWelcomeWhatsApp(first_name, mobile);

    if (!isAdminCreating) {
      // Clear signup cookie
      res.clearCookie('signup_verified_token');

      // Automatically log user in
      const userToken = jwt.sign(
        { profile_id: profileId, name: `${first_name} ${last_name || ''}`.trim(), mobile, role: 'user' },
        JWT_SECRET,
        { expiresIn: '365d' }
      );

      res.cookie('user_token', userToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60 * 1000
      });

      res.cookie('user_id', profileId, { httpOnly: true, maxAge: 365 * 24 * 60 * 60 * 1000 });
      res.cookie('user_name', `${first_name} ${last_name || ''}`.trim(), { httpOnly: true, maxAge: 365 * 24 * 60 * 60 * 1000 });
      res.cookie('mobile', mobile, { httpOnly: true, maxAge: 365 * 24 * 60 * 60 * 1000 });
    }

    return res.json({ success: true, profile_id: profileId });
  } catch (error) {
    console.error("createProfile error:", error);
    return res.status(500).json({ error: "Failed to create profile due to db error." });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  const profileId = parseInt(req.params.id);
  const token = req.cookies.user_token;
  const adminToken = req.cookies.admin_token;

  if (!token && !adminToken) {
    return res.status(401).json({ error: "Unauthorized access." });
  }

  let isAuthorized = false;
  let decodedUser = null;

  try {
    if (adminToken) {
      const decodedAdmin = jwt.verify(adminToken, JWT_SECRET);
      if (decodedAdmin.role === 'admin') isAuthorized = true;
    }

    if (token && !isAuthorized) {
      decodedUser = jwt.verify(token, JWT_SECRET);
    }
  } catch (e) {
    return res.status(401).json({ error: "Invalid session." });
  }

  try {
    const [profiles] = await db.query("SELECT * FROM profile WHERE profile_id = ?", [profileId]);
    if (profiles.length === 0) {
      return res.status(404).json({ error: "Profile not found." });
    }

    const profile = profiles[0];

    // Ownership check
    if (decodedUser && decodedUser.mobile !== profile.mobile) {
      return res.status(403).json({ error: "You do not own this profile." });
    }

    const {
      first_name,
      last_name,
      mobile,
      designation,
      company_name,
      alter_mobile,
      land_line,
      email,
      alter_email,
      website,
      address,
      notes,
      description,
      template,
      otp // Optional OTP field for verifying mobile changes
    } = req.body;

    // Mobile change validation
    const mobileChanged = mobile && mobile !== profile.mobile;

    if (mobileChanged) {
      // Validate mobile format
      if (!/^[0-9]{10}$/.test(mobile)) {
        return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
      }

      // Check if duplicate mobile exists
      const [duplicateCheck] = await db.query(
        "SELECT profile_id FROM profile WHERE mobile = ? AND profile_id != ?",
        [mobile, profileId]
      );
      if (duplicateCheck.length > 0) {
        return res.status(400).json({ error: "This mobile number is already registered with another account." });
      }

      // Only require OTP if NOT admin (i.e. isAuthorized is false)
      if (!isAuthorized) {
        // If OTP is not provided, trigger mobile change verification
        if (!otp) {
          const generatedOtp = await otpService.generateOTP(mobile);
          await otpService.sendWhatsAppOtp(mobile, generatedOtp);

          // Record OTP in DB
          await db.query("INSERT INTO otp_logs (phone, otp, created_at) VALUES (?, ?, NOW())", [mobile, generatedOtp]);

          // Return state indicating OTP verification is required
          return res.json({
            success: false,
            requireOtp: true,
            message: "OTP sent to verify your new mobile number."
          });
        } else {
          // Verify OTP
          const isOtpValid = await otpService.verifyOTP(mobile, otp);
          if (!isOtpValid) {
            return res.status(400).json({ error: "Invalid or expired OTP. Mobile change verification failed." });
          }
          // If valid, mobile changes will be committed below
        }
      }
    }

    // Handles file upload swaps
    const files = req.files || {};
    let profileImgPath = profile.profile_img;
    let backgroundImgPath = profile.background;

    if (files.profile_img_input && files.profile_img_input[0]) {
      const filename = files.profile_img_input[0].filename;
      profileImgPath = `uploads/profiles/${filename}`;
      // Delete old file if exists
      const oldPath = path.join(UPLOADS_DIR, '..', profile.profile_img || '');
      if (profile.profile_img && fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    if (files.background_img_input && files.background_img_input[0]) {
      const filename = files.background_img_input[0].filename;
      backgroundImgPath = `uploads/backgrounds/${filename}`;
      // Delete old file if exists
      const oldPath = path.join(UPLOADS_DIR, '..', profile.background || '');
      if (profile.background && fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Other inputs validation
    if (email && !/^[^\s@]+@[^\s@]+\.com$/.test(email)) {
      return res.status(400).json({ error: "Email must end with @email.com" });
    }
    if (alter_email && !/^[^\s@]+@[^\s@]+\.com$/.test(alter_email)) {
      return res.status(400).json({ error: "Alternative email must end with @email.com" });
    }
    if (alter_mobile && !/^[0-9]{10}$/.test(alter_mobile)) {
      return res.status(400).json({ error: "Alternative mobile must be exactly 10 digits" });
    }

    const updateTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const formattedUpdateTime = new Date(updateTime).toISOString().slice(0, 19).replace('T', ' ');

    await db.query(
      `UPDATE profile SET 
       first_name = ?, 
       last_name = ?, 
       profile_img = ?, 
       background = ?, 
       template = ?, 
       designation = ?, 
       company_name = ?, 
       mobile = ?, 
       alter_mobile = ?, 
       land_line = ?, 
       email = ?, 
       alter_email = ?, 
       website = ?, 
       address = ?, 
       notes = ?, 
       description = ?, 
       updated_at = ?
       WHERE profile_id = ?`,
      [
        first_name || profile.first_name,
        last_name !== undefined ? last_name : profile.last_name,
        profileImgPath,
        backgroundImgPath,
        template || profile.template,
        designation !== undefined ? designation : profile.designation,
        company_name !== undefined ? company_name : profile.company_name,
        mobile || profile.mobile,
        alter_mobile !== undefined ? alter_mobile : profile.alter_mobile,
        land_line !== undefined ? land_line : profile.land_line,
        email || profile.email,
        alter_email !== undefined ? alter_email : profile.alter_email,
        website !== undefined ? website : profile.website,
        address !== undefined ? address : profile.address,
        notes !== undefined ? notes : profile.notes,
        description !== undefined ? description : profile.description,
        formattedUpdateTime,
        profileId
      ]
    );

    // Refresh cookies if mobile changed
    if (mobileChanged && decodedUser) {
      const newCookieToken = jwt.sign(
        { profile_id: profileId, name: `${first_name || profile.first_name} ${last_name || profile.last_name || ''}`.trim(), mobile, role: 'user' },
        JWT_SECRET,
        { expiresIn: '365d' }
      );
      res.cookie('user_token', newCookieToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60 * 1000
      });
      res.cookie('mobile', mobile, { httpOnly: true, maxAge: 365 * 24 * 60 * 60 * 1000 });
    }

    return res.json({ success: true, message: "Profile updated successfully." });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ error: "Failed to update profile." });
  }
};

// Generate QR Code
exports.generateQrCode = async (req, res) => {
  const profileId = parseInt(req.params.id);
  const token = req.cookies.user_token;
  const adminToken = req.cookies.admin_token;

  if (!token && !adminToken) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM profile WHERE profile_id = ?", [profileId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Profile not found." });
    }

    const profile = rows[0];

    // Authorization
    let isAuthorized = false;
    if (adminToken) {
      const decodedAdmin = jwt.verify(adminToken, JWT_SECRET);
      if (decodedAdmin.role === 'admin') isAuthorized = true;
    }
    if (token && !isAuthorized) {
      const decodedUser = jwt.verify(token, JWT_SECRET);
      if (decodedUser.mobile === profile.mobile) isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: "You cannot generate QR code for this profile." });
    }

    // Configurable QR Code destination URL via .env
    const qrBaseUrl = process.env.QR_BASE_URL || 'http://localhost:5173/profile';
    const qrTargetUrl = `${qrBaseUrl}?user_id=${profileId}`;

    const qrContent = encodeURIComponent(qrTargetUrl);
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrContent}`;

    // Download QR Code
    const response = await axios.get(qrImageUrl, { responseType: 'arraybuffer' });
    const qrFilename = `qr_${profileId}_${Date.now()}.png`;
    const qrcodeDir = path.join(UPLOADS_DIR, 'qrcode');

    if (!fs.existsSync(qrcodeDir)) {
      fs.mkdirSync(qrcodeDir, { recursive: true });
    }

    const relativeQrPath = `uploads/qrcode/${qrFilename}`;
    const absoluteQrPath = path.join(qrcodeDir, qrFilename);

    fs.writeFileSync(absoluteQrPath, Buffer.from(response.data));

    // Delete old QR image if exists
    if (profile.qr_image) {
      const oldQrAbsolute = path.join(UPLOADS_DIR, '..', profile.qr_image);
      if (fs.existsSync(oldQrAbsolute)) {
        fs.unlinkSync(oldQrAbsolute);
      }
    }

    // Update DB
    await db.query(
      "UPDATE profile SET qr_image = ?, qr_status = 1 WHERE profile_id = ?",
      [relativeQrPath, profileId]
    );

    return res.json({ success: true, qr_image: relativeQrPath });
  } catch (error) {
    console.error("generateQrCode error:", error);
    return res.status(500).json({ error: "Failed to generate QR code." });
  }
};
