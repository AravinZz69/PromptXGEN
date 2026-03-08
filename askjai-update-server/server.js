require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const OWNER_SECRET = process.env.OWNER_SECRET_KEY;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

// Middleware
app.use(cors());
app.use(express.json());

// ── Helpers ──────────────────────────────────────────────

const MANIFEST_PATH = path.join(__dirname, 'manifest.json');
const RELEASES_DIR = path.join(__dirname, 'releases');

function readManifest() {
  return fs.readJsonSync(MANIFEST_PATH);
}

function writeManifest(data) {
  fs.writeJsonSync(MANIFEST_PATH, data, { spaces: 2 });
}

function ownerAuth(req, res, next) {
  const key = req.headers['x-owner-key'];
  if (!key || key !== OWNER_SECRET) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or missing x-owner-key header.' });
  }
  next();
}

// Multer config for file uploads
const upload = multer({ dest: path.join(__dirname, 'tmp_uploads') });

// ── PUBLIC ROUTES ────────────────────────────────────────

// 1. Health check
app.get('/health', (_req, res) => {
  const manifest = readManifest();
  res.json({ status: 'ok', version: manifest.latest_version, product: manifest.product });
});

// 2. Serve manifest.json
app.get('/manifest.json', (_req, res) => {
  try {
    const manifest = readManifest();
    res.json(manifest);
  } catch (err) {
    res.status(500).json({ error: 'Could not read manifest' });
  }
});

// 3. Download release ZIP
app.get('/releases/:version/download', (req, res) => {
  const version = req.params.version.startsWith('v') ? req.params.version : `v${req.params.version}`;
  const zipPath = path.join(RELEASES_DIR, version, 'update.zip');

  if (!fs.existsSync(zipPath)) {
    return res.status(404).json({ error: `Release ${version} not found` });
  }

  res.setHeader('Content-Disposition', `attachment; filename=askjai-${version}.zip`);
  res.setHeader('Content-Type', 'application/zip');
  fs.createReadStream(zipPath).pipe(res);
});

// 4. Get changelog for a version
app.get('/releases/:version/changelog', (req, res) => {
  const version = req.params.version.startsWith('v') ? req.params.version : `v${req.params.version}`;
  const changelogPath = path.join(RELEASES_DIR, version, 'changelog.md');

  if (!fs.existsSync(changelogPath)) {
    return res.status(404).json({ error: `Changelog for ${version} not found` });
  }

  const content = fs.readFileSync(changelogPath, 'utf-8');
  res.type('text/plain').send(content);
});

// ── PROTECTED OWNER ROUTES ───────────────────────────────

// 5. POST /owner/release — publish a new release to manifest
app.post('/owner/release', ownerAuth, (req, res) => {
  try {
    const { version, title, type, changelog, is_critical, size_mb, min_app_version, released_at } = req.body;

    if (!version) return res.status(400).json({ error: 'version is required' });

    const manifest = readManifest();
    const vTag = version.startsWith('v') ? version : `v${version}`;
    const cleanVersion = version.replace(/^v/, '');

    // Update manifest
    manifest.latest_version = cleanVersion;
    manifest.released_at = released_at || new Date().toISOString().split('T')[0];
    manifest.is_critical = is_critical || false;
    manifest.title = title || `Release ${cleanVersion}`;
    manifest.type = type || 'feature';
    manifest.changelog = changelog || [];
    manifest.download_url = `${SERVER_URL}/releases/${vTag}/download`;
    manifest.changelog_url = `${SERVER_URL}/releases/${vTag}/changelog`;
    manifest.size_mb = size_mb || 0;
    manifest.min_app_version = min_app_version || manifest.minimum_supported_version;

    if (min_app_version) {
      manifest.minimum_supported_version = min_app_version;
    }

    // Add to version history
    if (!manifest.version_history) manifest.version_history = [];
    const existingIdx = manifest.version_history.findIndex(v => v.version === cleanVersion);
    const historyEntry = {
      version: cleanVersion,
      released_at: manifest.released_at,
      type: manifest.type,
      title: manifest.title,
    };
    if (existingIdx >= 0) {
      manifest.version_history[existingIdx] = historyEntry;
    } else {
      manifest.version_history.unshift(historyEntry);
    }

    writeManifest(manifest);

    // Ensure release folder exists
    const releaseDir = path.join(RELEASES_DIR, vTag);
    fs.ensureDirSync(releaseDir);

    // Write changelog.md if changelog provided
    if (changelog && changelog.length > 0) {
      const mdContent = `# ${title || `Release ${cleanVersion}`}\n\n${changelog.map(c => `- ${c}`).join('\n')}\n`;
      fs.writeFileSync(path.join(releaseDir, 'changelog.md'), mdContent);
    }

    res.json({ success: true, message: `Release ${cleanVersion} published`, manifest });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create release', details: err.message });
  }
});

// 6. POST /owner/upload-release — upload ZIP and changelog files
app.post('/owner/upload-release', ownerAuth, upload.fields([
  { name: 'zip', maxCount: 1 },
  { name: 'changelog', maxCount: 1 },
]), (req, res) => {
  try {
    const version = req.body.version;
    if (!version) return res.status(400).json({ error: 'version is required in body' });

    const vTag = version.startsWith('v') ? version : `v${version}`;
    const releaseDir = path.join(RELEASES_DIR, vTag);
    fs.ensureDirSync(releaseDir);

    // Move ZIP file
    if (req.files && req.files.zip && req.files.zip[0]) {
      const zipFile = req.files.zip[0];
      fs.moveSync(zipFile.path, path.join(releaseDir, 'update.zip'), { overwrite: true });
    }

    // Move changelog
    if (req.files && req.files.changelog && req.files.changelog[0]) {
      const changelogFile = req.files.changelog[0];
      fs.moveSync(changelogFile.path, path.join(releaseDir, 'changelog.md'), { overwrite: true });
    }

    res.json({ success: true, message: `Files uploaded for ${vTag}`, path: releaseDir });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

// 7. GET /owner/stats — release statistics
app.get('/owner/stats', ownerAuth, (_req, res) => {
  try {
    const manifest = readManifest();
    res.json({
      product: manifest.product,
      latest_version: manifest.latest_version,
      total_releases: manifest.version_history ? manifest.version_history.length : 0,
      version_history: manifest.version_history || [],
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not read stats' });
  }
});

// ── START ─────────────────────────────────────────────────

// Ensure releases folder exists
fs.ensureDirSync(RELEASES_DIR);

app.listen(PORT, () => {
  console.log(`\n🚀 AskJai Update Server running on port ${PORT}`);
  console.log(`   Health:   ${SERVER_URL}/health`);
  console.log(`   Manifest: ${SERVER_URL}/manifest.json\n`);
});
