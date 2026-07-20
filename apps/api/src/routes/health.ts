import { Router } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.get('/version', (req, res) => {
  let packageVersion = '1.0.0';
  
  try {
    // Attempt to read package.json version
    const pkgPath = join(process.cwd(), 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    if (pkg.version) {
      packageVersion = pkg.version;
    }
  } catch (err) {
    console.error('Could not read package.json version', err);
  }

  res.status(200).json({
    version: packageVersion,
    environment: process.env.NODE_ENV || 'development',
    commit: process.env.COMMIT_SHA || 'unknown',
    buildTime: process.env.BUILD_TIME || 'unknown'
  });
});

export default router;
