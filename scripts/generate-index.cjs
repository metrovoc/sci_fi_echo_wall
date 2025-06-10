#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function generateIndex() {
  const contentsDir = path.join(process.cwd(), "contents");

  // Check if contents directory exists
  if (!fs.existsSync(contentsDir)) {
    console.log("Contents directory not found, skipping index generation");
    return;
  }

  // Always generate a new index.json, so don't check for existence
  const indexPath = path.join(contentsDir, "index.json");
  // if (fs.existsSync(indexPath)) {
  //   console.log("index.json already exists, skipping auto-generation");
  //   return;
  // }

  // Read all markdown files
  const files = fs
    .readdirSync(contentsDir)
    .filter((file) => file.endsWith(".md") || file.endsWith(".markdown"))
    .sort((a, b) => {
      // Smart sorting: numbers before letters, preserve order
      const aNum = extractNumber(a);
      const bNum = extractNumber(b);

      if (aNum !== null && bNum !== null) {
        return aNum - bNum;
      }

      // Special chapter order
      const order = {
        intro: 0,
        introduction: 0,
        preface: 0,
        序言: 0,
        前言: 0,
        epilogue: 999,
        conclusion: 999,
        后记: 999,
        结语: 999,
      };

      const aOrder = getSpecialOrder(a, order);
      const bOrder = getSpecialOrder(b, order);

      if (aOrder !== null && bOrder !== null) {
        return aOrder - bOrder;
      }
      if (aOrder !== null) return -1;
      if (bOrder !== null) return 1;

      // Default alphabetical sort
      return a.localeCompare(b, "zh-CN", { numeric: true });
    });

  if (files.length === 0) {
    console.log("No markdown files found in contents directory");
    return;
  }

  // Generate index.json
  const index = { files };

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`Generated index.json with ${files.length} chapters:`);
  files.forEach((file, i) => console.log(`  ${i + 1}. ${file}`));
}

function extractNumber(filename) {
  const patterns = [/chapter(\d+)/i, /ch(\d+)/i, /第(\d+)章/, /^(\d+)/];

  for (const pattern of patterns) {
    const match = filename.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }

  return null;
}

function getSpecialOrder(filename, orderMap) {
  const baseName = path
    .basename(filename, path.extname(filename))
    .toLowerCase();
  return orderMap[baseName] || null;
}

// Run if called directly
if (require.main === module) {
  generateIndex();
}

module.exports = { generateIndex };
