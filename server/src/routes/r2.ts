import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import {
  createPresignedPutUrl,
  createPresignedGetUrl,
  deleteObject,
  listUserObjects,
} from '../services/r2Service.js';

const router = Router();

// POST /api/r2/presign-upload
router.post('/r2/presign-upload', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { labId, category, fileName, contentType, contentLength } = req.body || {};

    if (!fileName || typeof fileName !== 'string') {
      res.status(400).json({ error: 'Missing required field: fileName' });
      return;
    }

    if (!contentType || typeof contentType !== 'string') {
      res.status(400).json({ error: 'Missing required field: contentType' });
      return;
    }

    const result = await createPresignedPutUrl({
      userId: user.userId,
      labId: labId || 'general',
      category: category || 'diagrams',
      fileName,
      contentType,
      contentLength: contentLength ? Number(contentLength) : undefined,
    });

    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to generate presigned upload URL' });
  }
});

// POST /api/r2/presign-download
router.post('/r2/presign-download', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { key, expiresInSeconds } = req.body || {};

    if (!key || typeof key !== 'string') {
      res.status(400).json({ error: 'Missing required field: key' });
      return;
    }

    const result = await createPresignedGetUrl({
      userId: user.userId,
      key,
      expiresInSeconds: expiresInSeconds ? Number(expiresInSeconds) : undefined,
    });

    res.status(200).json(result);
  } catch (err: any) {
    res.status(403).json({ error: err?.message || 'Access denied to target object' });
  }
});

// POST /api/r2/delete
router.post('/r2/delete', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { key } = req.body || {};

    if (!key || typeof key !== 'string') {
      res.status(400).json({ error: 'Missing required field: key' });
      return;
    }

    const result = await deleteObject({
      userId: user.userId,
      key,
    });

    res.status(200).json(result);
  } catch (err: any) {
    res.status(403).json({ error: err?.message || 'Failed to delete target object' });
  }
});

// GET /api/r2/list
router.get('/r2/list', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const labId = req.query.labId as string | undefined;

    const objects = await listUserObjects({
      userId: user.userId,
      labId,
    });

    res.status(200).json({ objects });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to list user objects' });
  }
});

export default router;
