// validator.js

const fs = require("fs");
const yaml = require("js-yaml");

// ----------- Validators -----------

function isIPv4(ip) {
  if (typeof ip !== "string") return false;
  const parts = ip.split(".");
  if (parts.length !== 4) return false;

  return parts.every(p => {
    if (!/^\d+$/.test(p)) return false;
    const n = Number(p);
    return n >= 0 && n <= 255;
  });
}

function isIPv6(ip) {
  return typeof ip === "string" &&
    /^[0-9a-fA-F:]+$/.test(ip) &&
    ip.includes(":");
}

function isCIDR(cidr) {
  if (typeof cidr !== "string") return false;
  const [ip, mask] = cidr.split("/");
  if (!mask) return false;

  const m = Number(mask);
  if (isIPv4(ip)) return m >= 0 && m <= 32;
  if (isIPv6(ip)) return m >= 0 && m <= 128;

  return false;
}

// ----------- Schema -----------

const VALID_TYPES = new Set([
  "network",
  "service",
  "host",
  "ip",
  "multicast"
]);

// ----------- Recursive Validation -----------

function validateNode(node, path, ids, errors) {
  if (typeof node !== "object") {
    errors.push(`${path} must be an object`);
    return;
  }

  // id
  if (!node.id || typeof node.id !== "string") {
    errors.push(`${path}.id must be a string`);
  } else {
    if (ids.has(node.id)) {
      errors.push(`Duplicate id: ${node.id}`);
    }
    ids.add(node.id);
  }

  // type
  if (!VALID_TYPES.has(node.type)) {
    errors.push(`${path}.type invalid: ${node.type}`);
  }

  // IP validation
  if (node.type === "ip" || node.type === "host") {
    if (!isIPv4(node.id) && !isIPv6(node.id)) {
      errors.push(`${path} (${node.id}) is not a valid IP`);
    }
  }

  // multicast validation
  if (node.type === "multicast") {
    if (!isIPv4(node.id)) {
      errors.push(`${path} multicast must be IPv4`);
    } else {
      const first = Number(node.id.split(".")[0]);
      if (first < 224 || first > 239) {
        errors.push(`${path} not in multicast range`);
      }
    }
  }

  // CIDR validation
  if (node.cidr && !isCIDR(node.cidr)) {
    errors.push(`${path}.cidr invalid: ${node.cidr}`);
  }

  // children recursion
  if (node.children) {
    if (!Array.isArray(node.children)) {
      errors.push(`${path}.children must be array`);
    } else {
      node.children.forEach((child, i) =>
        validateNode(child, `${path}.children[${i}]`, ids, errors)
      );
    }
  }
}

// ----------- References -----------

function validateReferences(refs, ids, errors) {
  if (!Array.isArray(refs)) return;

  refs.forEach((ref, i) => {
    if (!ids.has(ref.from)) {
      errors.push(`references[${i}].from not found: ${ref.from}`);
    }
    if (!ids.has(ref.to)) {
      errors.push(`references[${i}].to not found: ${ref.to}`);
    }
    if (typeof ref.relationship !== "string") {
      errors.push(`references[${i}].relationship must be string`);
    }
  });
}

// ----------- Main -----------

function validateTopology(file) {
  const raw = fs.readFileSync(file, "utf8");
  const data = yaml.load(raw);

  const errors = [];
  const ids = new Set();

  validateNode(data, "root", ids, errors);
  validateReferences(data.references, ids, errors);

  if (errors.length) {
    console.error("❌ Validation failed:\n");
    errors.forEach(e => console.error(" -", e));
    process.exit(1);
  }

  console.log("✅ Topology is valid");
}

// Run
if (require.main === module) {
  const file = process.argv[2] || "topology.yaml";
  validateTopology(file);
}
