// javascript.js

const fs = require("fs");
const toml = require("toml");

// ----------- Type Validators -----------

// Strict IPv4 validator
function isIPv4(ip) {
  if (typeof ip !== "string") return false;

  const parts = ip.split(".");
  if (parts.length !== 4) return false;

  return parts.every(part => {
    if (!/^\d+$/.test(part)) return false;
    const num = Number(part);
    return num >= 0 && num <= 255;
  });
}

// Basic IPv6 validator (not perfect but solid)
function isIPv6(ip) {
  if (typeof ip !== "string") return false;

  // Handles compressed (::) and full forms
  return /^[0-9a-fA-F:]+$/.test(ip) && ip.includes(":");
}

// ----------- Schema Validation -----------

function validateConfig(config) {
  const errors = [];

  // Check firewall root
  if (!config.firewall) {
    errors.push("Missing [firewall] section");
    return errors;
  }

  const fw = config.firewall;

  // Validate default_policy
  if (!["allow", "deny"].includes(fw.default_policy)) {
    errors.push("firewall.default_policy must be 'allow' or 'deny'");
  }

  // Validate IPv4 blocklist
  const ipv4List = fw.blocklist?.ipv4?.addresses || [];
  ipv4List.forEach(ip => {
    if (!isIPv4(ip)) {
      errors.push(`Invalid IPv4 address: ${ip}`);
    }
  });

  // Validate IPv6 blocklist
  const ipv6List = fw.blocklist?.ipv6?.addresses || [];
  ipv6List.forEach(ip => {
    if (!isIPv6(ip)) {
      errors.push(`Invalid IPv6 address: ${ip}`);
    }
  });

  // Validate rules
  if (!Array.isArray(fw.rules)) {
    errors.push("firewall.rules must be an array");
  } else {
    fw.rules.forEach((rule, i) => {
      if (!["block", "allow"].includes(rule.action)) {
        errors.push(`Rule[${i}] invalid action`);
      }

      if (!["in", "out"].includes(rule.direction)) {
        errors.push(`Rule[${i}] invalid direction`);
      }

      if (!["ipv4", "ipv6"].includes(rule.ip_version)) {
        errors.push(`Rule[${i}] invalid ip_version`);
      }

      // Validate source reference
      if (rule.source === "firewall.blocklist.ipv4.addresses") {
        if (ipv4List.length === 0) {
          errors.push(`Rule[${i}] references empty IPv4 list`);
        }
      } else if (rule.source === "firewall.blocklist.ipv6.addresses") {
        if (ipv6List.length === 0) {
          errors.push(`Rule[${i}] references empty IPv6 list`);
        }
      } else {
        errors.push(`Rule[${i}] invalid source reference: ${rule.source}`);
      }
    });
  }

  return errors;
}

// ----------- Main -----------

function loadAndValidate(path) {
  try {
    const raw = fs.readFileSync(path, "utf-8");
    const config = toml.parse(raw);

    const errors = validateConfig(config);

    if (errors.length > 0) {
      console.error("❌ Validation failed:");
      errors.forEach(e => console.error(" -", e));
      process.exit(1);
    }

    console.log("✅ Config is valid");
    return config;

  } catch (err) {
    console.error("❌ Failed to parse TOML:", err.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  const file = process.argv[2] || "firewall.toml";
  loadAndValidate(file);
}
