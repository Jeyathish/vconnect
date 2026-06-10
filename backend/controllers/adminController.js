const path = require('path');
const fs = require('fs');
const db = require('../db/connection');

// Dashboard statistics & charts
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Counts
    const [[activeAdminsRes]] = await db.query("SELECT COUNT(*) as count FROM admin_users WHERE status = 'active'");
    const [[todayVisitorsRes]] = await db.query("SELECT COUNT(*) as count FROM visitor_logs WHERE DATE(visited_at) = CURDATE()");
    const [[weekVisitorsRes]] = await db.query("SELECT COUNT(*) as count FROM visitor_logs WHERE visited_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
    const [[monthVisitorsRes]] = await db.query("SELECT COUNT(*) as count FROM visitor_logs WHERE visited_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
    const [[yearVisitorsRes]] = await db.query("SELECT COUNT(*) as count FROM visitor_logs WHERE visited_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)");
    const [[totalProfilesRes]] = await db.query("SELECT COUNT(*) as count FROM profile");

    // 2. Chart data: Visitor Traffic (Last 30 Days)
    const [trafficRows] = await db.query(`
      SELECT DATE(visited_at) as date, COUNT(*) as count 
      FROM visitor_logs 
      WHERE visited_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
      GROUP BY DATE(visited_at) 
      ORDER BY date ASC
    `);

    // 3. Chart data: Top Visited Pages
    const [topPagesRows] = await db.query(`
      SELECT page_visited, COUNT(*) as count 
      FROM visitor_logs 
      WHERE page_visited IS NOT NULL AND page_visited != ''
      GROUP BY page_visited 
      ORDER BY count DESC 
      LIMIT 10
    `);

    // 4. Chart data: Visitor Locations
    const [locationsRows] = await db.query(`
      SELECT country, COUNT(*) as count 
      FROM visitor_logs 
      WHERE country IS NOT NULL AND country != ''
      GROUP BY country 
      ORDER BY count DESC 
      LIMIT 10
    `);

    return res.json({
      stats: {
        activeAdmins: activeAdminsRes.count,
        todayVisitors: todayVisitorsRes.count,
        weekVisitors: weekVisitorsRes.count,
        monthVisitors: monthVisitorsRes.count,
        yearVisitors: yearVisitorsRes.count,
        totalProfiles: totalProfilesRes.count
      },
      charts: {
        traffic: trafficRows.map(r => ({
          date: r.date ? new Date(r.date).toISOString().split('T')[0] : 'Unknown',
          count: r.count
        })),
        topPages: topPagesRows,
        locations: locationsRows
      }
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    return res.status(500).json({ error: "Failed to fetch dashboard stats." });
  }
};

// Profiles Management (Search, Paginate)
exports.getProfiles = async (req, res) => {
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    let query = "SELECT * FROM profile";
    let countQuery = "SELECT COUNT(*) as count FROM profile";
    let queryParams = [];

    if (search) {
      const searchPattern = `%${search}%`;
      const filter = " WHERE first_name LIKE ? OR last_name LIKE ? OR mobile LIKE ? OR email LIKE ? OR company_name LIKE ? OR designation LIKE ?";
      query += filter;
      countQuery += filter;
      queryParams = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern];
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    const [profiles] = await db.query(query, queryParams);
    const [[{ count }]] = await db.query(countQuery, queryParams.slice(0, -2));

    return res.json({
      profiles,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error("getProfiles error:", error);
    return res.status(500).json({ error: "Failed to fetch profiles." });
  }
};

// Export Profiles CSV
exports.exportProfilesCSV = async (req, res) => {
  const search = req.query.search || '';
  try {
    let query = "SELECT * FROM profile";
    let queryParams = [];

    if (search) {
      const searchPattern = `%${search}%`;
      query += " WHERE first_name LIKE ? OR last_name LIKE ? OR mobile LIKE ? OR email LIKE ? OR company_name LIKE ? OR designation LIKE ?";
      queryParams = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern];
    }
    query += " ORDER BY created_at DESC";

    const [profiles] = await db.query(query, queryParams);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="profiles_' + new Date().toISOString().split('T')[0] + '.csv"');

    // CSV Headers
    let csvData = "S.No,Full Name,Mobile,Email,Company,Designation,Created Date\n";
    let sno = 1;

    for (const p of profiles) {
      const name = `${p.first_name} ${p.last_name || ''}`.trim().replace(/"/g, '""');
      const mobile = p.mobile || '';
      const email = p.email || '';
      const company = (p.company_name || '').replace(/"/g, '""');
      const designation = (p.designation || '').replace(/"/g, '""');
      const created = p.created_at || '';

      csvData += `${sno++},"${name}","${mobile}","${email}","${company}","${designation}","${created}"\n`;
    }

    return res.send(csvData);
  } catch (error) {
    console.error("exportProfilesCSV error:", error);
    return res.status(500).json({ error: "Failed to export profile data." });
  }
};

// Delete User Profile
exports.deleteProfile = async (req, res) => {
  const profileId = parseInt(req.params.id);
  try {
    const [rows] = await db.query("SELECT profile_img, background, qr_image FROM profile WHERE profile_id = ?", [profileId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Profile not found." });
    }

    const p = rows[0];
    const uploadsBase = path.join(__dirname, '..', '..');

    // Clean up local files
    if (p.profile_img) {
      const fpath = path.join(uploadsBase, p.profile_img);
      if (fs.existsSync(fpath)) fs.unlinkSync(fpath);
    }
    if (p.background) {
      const fpath = path.join(uploadsBase, p.background);
      if (fs.existsSync(fpath)) fs.unlinkSync(fpath);
    }
    if (p.qr_image) {
      const fpath = path.join(uploadsBase, p.qr_image);
      if (fs.existsSync(fpath)) fs.unlinkSync(fpath);
    }

    await db.query("DELETE FROM profile WHERE profile_id = ?", [profileId]);
    return res.json({ success: true, message: "Profile deleted successfully." });
  } catch (error) {
    console.error("deleteProfile error:", error);
    return res.status(500).json({ error: "Failed to delete profile." });
  }
};

// Visitor Logs Management (Filters, Search, Paginate)
exports.getVisitorLogs = async (req, res) => {
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const offset = (page - 1) * limit;

  // Filters
  const device = req.query.device || '';
  const country = req.query.country || '';
  const startDate = req.query.startDate || '';
  const endDate = req.query.endDate || '';

  try {
    let query = "SELECT * FROM visitor_logs";
    let countQuery = "SELECT COUNT(*) as count FROM visitor_logs";
    let queryParams = [];
    const conditions = [];

    if (search) {
      const pattern = `%${search}%`;
      conditions.push("(ip LIKE ? OR city LIKE ? OR region LIKE ? OR country LIKE ? OR device LIKE ? OR page_visited LIKE ?)");
      queryParams.push(pattern, pattern, pattern, pattern, pattern, pattern);
    }

    if (device) {
      conditions.push("device LIKE ?");
      queryParams.push(`%${device}%`);
    }

    if (country) {
      conditions.push("country = ?");
      queryParams.push(country);
    }

    if (startDate) {
      conditions.push("visited_at >= ?");
      queryParams.push(`${startDate} 00:00:00`);
    }

    if (endDate) {
      conditions.push("visited_at <= ?");
      queryParams.push(`${endDate} 23:59:59`);
    }

    if (conditions.length > 0) {
      const filterStr = " WHERE " + conditions.join(" AND ");
      query += filterStr;
      countQuery += filterStr;
    }

    query += " ORDER BY visited_at DESC LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    const [logs] = await db.query(query, queryParams);
    const [[{ count }]] = await db.query(countQuery, queryParams.slice(0, -2));

    // Get list of unique countries & devices for filters dropdown
    const [countries] = await db.query("SELECT DISTINCT country FROM visitor_logs WHERE country IS NOT NULL AND country != '' ORDER BY country ASC");
    const [devices] = await db.query("SELECT DISTINCT device FROM visitor_logs WHERE device IS NOT NULL AND device != '' ORDER BY device ASC");

    return res.json({
      logs,
      filterOptions: {
        countries: countries.map(c => c.country),
        devices: devices.map(d => d.device)
      },
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error("getVisitorLogs error:", error);
    return res.status(500).json({ error: "Failed to fetch visitor logs." });
  }
};

// Admin User Management CRUD
exports.getAdminUsers = async (req, res) => {
  const search = req.query.search || '';
  try {
    let query = "SELECT nos, id, username, status, created_at FROM admin_users";
    let params = [];
    if (search) {
      query += " WHERE username LIKE ? OR id LIKE ?";
      params = [`%${search}%`, `%${search}%`];
    }
    query += " ORDER BY created_at DESC";
    const [users] = await db.query(query, params);
    return res.json({ users });
  } catch (error) {
    console.error("getAdminUsers error:", error);
    return res.status(500).json({ error: "Failed to fetch admin users." });
  }
};

exports.createAdminUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const [existing] = await db.query("SELECT nos FROM admin_users WHERE username = ?", [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Username already exists." });
    }

    // Generate unique 6-digit ID matching the format in seed SQL (e.g. 000007)
    const [[maxIdRes]] = await db.query("SELECT MAX(CAST(id AS UNSIGNED)) as maxId FROM admin_users");
    const nextIdNum = (maxIdRes.maxId || 0) + 1;
    const formattedId = nextIdNum.toString().padStart(6, '0');

    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await db.query(
      "INSERT INTO admin_users (id, username, password, created_at, updated_at, status) VALUES (?, ?, ?, ?, ?, 'active')",
      [formattedId, username, password, timestamp, timestamp]
    );

    return res.json({ success: true, message: "Admin user created successfully." });
  } catch (error) {
    console.error("createAdminUser error:", error);
    return res.status(500).json({ error: "Failed to create admin user." });
  }
};

exports.updateAdminUser = async (req, res) => {
  const adminId = parseInt(req.params.id);
  const { username, password, status } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM admin_users WHERE nos = ?", [adminId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Admin user not found." });
    }

    const admin = rows[0];
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Check duplicate username if name changed
    if (username && username !== admin.username) {
      const [existing] = await db.query("SELECT nos FROM admin_users WHERE username = ? AND nos != ?", [username, adminId]);
      if (existing.length > 0) {
        return res.status(400).json({ error: "Username already exists." });
      }
    }

    const finalUsername = username || admin.username;
    const finalPassword = password || admin.password;
    const finalStatus = status || admin.status;

    await db.query(
      "UPDATE admin_users SET username = ?, password = ?, status = ?, updated_at = ? WHERE nos = ?",
      [finalUsername, finalPassword, finalStatus, timestamp, adminId]
    );

    return res.json({ success: true, message: "Admin user updated successfully." });
  } catch (error) {
    console.error("updateAdminUser error:", error);
    return res.status(500).json({ error: "Failed to update admin user." });
  }
};

exports.deleteAdminUser = async (req, res) => {
  const adminId = parseInt(req.params.id);
  try {
    const [rows] = await db.query("SELECT username FROM admin_users WHERE nos = ?", [adminId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Admin user not found." });
    }

    // Do not delete last admin
    const [countRows] = await db.query("SELECT COUNT(*) as count FROM admin_users");
    if (countRows[0].count <= 1) {
      return res.status(400).json({ error: "Cannot delete the only remaining admin user." });
    }

    await db.query("DELETE FROM admin_users WHERE nos = ?", [adminId]);
    return res.json({ success: true, message: "Admin user deleted successfully." });
  } catch (error) {
    console.error("deleteAdminUser error:", error);
    return res.status(500).json({ error: "Failed to delete admin user." });
  }
};

// Admin Password Change
exports.changeAdminPassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const adminSession = req.cookies.admin_token;

  if (!adminSession) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: "All password fields are required." });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "New passwords do not match." });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(adminSession, process.env.JWT_SECRET || 'bkads_secret_key_jwt_session_secure_2026');

    const [rows] = await db.query("SELECT password FROM admin_users WHERE id = ?", [decoded.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Admin account not found." });
    }

    const dbPassword = rows[0].password;
    if (currentPassword !== dbPassword) {
      return res.status(400).json({ error: "Incorrect current password." });
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.query("UPDATE admin_users SET password = ?, updated_at = ? WHERE id = ?", [newPassword, timestamp, decoded.id]);

    return res.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("changeAdminPassword error:", error);
    return res.status(500).json({ error: "Failed to change password." });
  }
};

// Profile / Admin Status Toggle
exports.toggleAdminUserStatus = async (req, res) => {
  const adminId = parseInt(req.params.id);
  try {
    const [rows] = await db.query("SELECT status FROM admin_users WHERE nos = ?", [adminId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Admin user not found." });
    }

    const currentStatus = rows[0].status;
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await db.query("UPDATE admin_users SET status = ?, updated_at = ? WHERE nos = ?", [nextStatus, timestamp, adminId]);
    return res.json({ success: true, status: nextStatus, message: `Status updated to ${nextStatus}.` });
  } catch (error) {
    console.error("toggleAdminUserStatus error:", error);
    return res.status(500).json({ error: "Failed to toggle status." });
  }
};
