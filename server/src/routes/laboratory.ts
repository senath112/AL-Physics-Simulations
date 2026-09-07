import { Router, Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import pool from '../services/db';

const router = Router();

// GET /api/laboratory/practicals - List user practicals
router.get('/laboratory/practicals', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const [rows]: any = await pool.query(
      'SELECT id, user_id as userId, title, simulation_id as simulationId, simulation_title as simulationTitle, category, created_at as createdAt, updated_at as updatedAt, columns_json as columns, data_json as data, notes, report_json as report, graph_config_json as graphConfig, diagram_url as diagramUrl, diagram_key as diagramKey FROM practicals WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );

    const practicals = (rows || []).map((row: any) => ({
      ...row,
      columns: typeof row.columns === 'string' ? JSON.parse(row.columns) : row.columns,
      data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
      report: typeof row.report === 'string' ? JSON.parse(row.report) : row.report,
      graphConfig: typeof row.graphConfig === 'string' ? JSON.parse(row.graphConfig) : row.graphConfig,
    }));

    res.status(200).json({ practicals });
  } catch (err: any) {
    console.error('[ERROR] /api/laboratory/practicals GET failed:', err);
    res.status(500).json({
      error: 'Failed to retrieve laboratory practicals',
      ...(process.env.NODE_ENV !== 'production' && err?.message ? { debug: err.message } : {}),
    });
  }
});

const MAX_PRACTICALS_PER_USER = 10;
const MAX_TITLE_LENGTH = 200;
const MAX_NOTES_LENGTH = 5000;
const MAX_DATA_ROWS = 500;
const MAX_COLUMNS = 20;

// POST /api/laboratory/practicals - Create or update practical
router.post('/laboratory/practicals', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {
      id,
      title,
      simulationId,
      simulationTitle,
      category = 'mechanics',
      columns,
      data,
      notes = '',
      report,
      graphConfig,
      diagramUrl,
      diagramKey,
    } = req.body || {};

    if (!simulationId || typeof simulationId !== 'string' || !title || typeof title !== 'string') {
      res.status(400).json({ error: 'Missing required title or simulationId' });
      return;
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0 || trimmedTitle.length > MAX_TITLE_LENGTH) {
      res.status(400).json({ error: `Title must be between 1 and ${MAX_TITLE_LENGTH} characters.` });
      return;
    }

    const safeNotes = typeof notes === 'string' ? notes.slice(0, MAX_NOTES_LENGTH) : '';

    if (columns !== undefined && (!Array.isArray(columns) || columns.length > MAX_COLUMNS)) {
      res.status(400).json({ error: `Columns must be an array of at most ${MAX_COLUMNS} items.` });
      return;
    }

    if (data !== undefined && (!Array.isArray(data) || data.length > MAX_DATA_ROWS)) {
      res.status(400).json({ error: `Data rows cannot exceed ${MAX_DATA_ROWS} entries.` });
      return;
    }

    const columnsJson = JSON.stringify(columns || []);
    const dataJson = JSON.stringify(data || []);
    const reportJson = JSON.stringify(report || {});
    const graphConfigJson = JSON.stringify(graphConfig || {});

    let pracId = id;

    if (pracId && typeof pracId === 'string') {
      // Check if existing record exists and verify ownership (Prevent BOLA/IDOR)
      const [existingRows]: any = await pool.query(
        'SELECT user_id FROM practicals WHERE id = ?',
        [pracId]
      );

      if (existingRows && existingRows.length > 0) {
        if (existingRows[0].user_id !== userId) {
          res.status(403).json({ error: 'Access denied: You do not have permission to modify this practical.' });
          return;
        }

        // Safe authenticated update
        await pool.query(
          `UPDATE practicals SET
            title = ?,
            simulation_title = ?,
            category = ?,
            updated_at = NOW(),
            columns_json = ?,
            data_json = ?,
            notes = ?,
            report_json = ?,
            graph_config_json = ?,
            diagram_url = ?,
            diagram_key = ?
          WHERE id = ? AND user_id = ?`,
          [
            trimmedTitle,
            typeof simulationTitle === 'string' ? simulationTitle.slice(0, 100) : 'Physics',
            typeof category === 'string' ? category.slice(0, 50) : 'mechanics',
            columnsJson,
            dataJson,
            safeNotes,
            reportJson,
            graphConfigJson,
            diagramUrl || null,
            diagramKey || null,
            pracId,
            userId,
          ]
        );
      } else {
        // ID provided but does not exist in DB yet: verify user storage quota before insert
        const [countRows]: any = await pool.query(
          'SELECT COUNT(*) as cnt FROM practicals WHERE user_id = ?',
          [userId]
        );
        const currentCount = Number(countRows?.[0]?.cnt || 0);
        if (currentCount >= MAX_PRACTICALS_PER_USER) {
          res.status(400).json({
            error: `Storage quota exceeded. You have reached the maximum limit of ${MAX_PRACTICALS_PER_USER} saved practicals. Please delete an older practical to save a new one.`,
          });
          return;
        }

        await pool.query(
          `INSERT INTO practicals 
            (id, user_id, title, simulation_id, simulation_title, category, created_at, updated_at, columns_json, data_json, notes, report_json, graph_config_json, diagram_url, diagram_key)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?)`,
          [
            pracId,
            userId,
            trimmedTitle,
            simulationId.slice(0, 100),
            typeof simulationTitle === 'string' ? simulationTitle.slice(0, 100) : 'Physics',
            typeof category === 'string' ? category.slice(0, 50) : 'mechanics',
            columnsJson,
            dataJson,
            safeNotes,
            reportJson,
            graphConfigJson,
            diagramUrl || null,
            diagramKey || null,
          ]
        );
      }
    } else {
      // New practical: check quota before generating ID and inserting
      const [countRows]: any = await pool.query(
        'SELECT COUNT(*) as cnt FROM practicals WHERE user_id = ?',
        [userId]
      );
      const currentCount = Number(countRows?.[0]?.cnt || 0);
      if (currentCount >= MAX_PRACTICALS_PER_USER) {
        res.status(400).json({
          error: `Storage quota exceeded. You have reached the maximum limit of ${MAX_PRACTICALS_PER_USER} saved practicals. Please delete an older practical to save a new one.`,
        });
        return;
      }

      pracId = `prac_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      await pool.query(
        `INSERT INTO practicals 
          (id, user_id, title, simulation_id, simulation_title, category, created_at, updated_at, columns_json, data_json, notes, report_json, graph_config_json, diagram_url, diagram_key)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?)`,
        [
          pracId,
          userId,
          trimmedTitle,
          simulationId.slice(0, 100),
          typeof simulationTitle === 'string' ? simulationTitle.slice(0, 100) : 'Physics',
          typeof category === 'string' ? category.slice(0, 50) : 'mechanics',
          columnsJson,
          dataJson,
          safeNotes,
          reportJson,
          graphConfigJson,
          diagramUrl || null,
          diagramKey || null,
        ]
      );
    }

    res.status(200).json({
      success: true,
      practical: {
        id: pracId,
        userId,
        title: trimmedTitle,
        simulationId,
        simulationTitle,
        category,
        columns,
        data,
        notes: safeNotes,
        report,
        graphConfig,
        diagramUrl,
        diagramKey,
      },
    });
  } catch (err: any) {
    console.error('[ERROR] /api/laboratory/practicals POST failed:', err);
    res.status(500).json({
      error: 'Failed to save practical',
      ...(process.env.NODE_ENV !== 'production' && err?.message ? { debug: err.message } : {}),
    });
  }
});

// DELETE /api/laboratory/practicals/:id - Delete practical
router.delete('/laboratory/practicals/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const pracId = req.params.id;

    await pool.query('DELETE FROM practicals WHERE id = ? AND user_id = ?', [pracId, userId]);
    res.status(200).json({ success: true, id: pracId });
  } catch (err: any) {
    console.error('[ERROR] /api/laboratory/practicals DELETE failed:', err);
    res.status(500).json({
      error: 'Failed to delete practical',
      ...(process.env.NODE_ENV !== 'production' && err?.message ? { debug: err.message } : {}),
    });
  }
});

export default router;
