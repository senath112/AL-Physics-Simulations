import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import pool from '../services/db.js';

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
    res.status(500).json({ error: 'Failed to retrieve laboratory practicals', message: err?.message });
  }
});

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

    if (!simulationId || !title) {
      res.status(400).json({ error: 'Missing required title or simulationId' });
      return;
    }

    const pracId = id || `prac_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const columnsJson = JSON.stringify(columns || []);
    const dataJson = JSON.stringify(data || []);
    const reportJson = JSON.stringify(report || {});
    const graphConfigJson = JSON.stringify(graphConfig || {});

    await pool.query(
      `INSERT INTO practicals 
        (id, user_id, title, simulation_id, simulation_title, category, created_at, updated_at, columns_json, data_json, notes, report_json, graph_config_json, diagram_url, diagram_key)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        category = VALUES(category),
        updated_at = NOW(),
        columns_json = VALUES(columns_json),
        data_json = VALUES(data_json),
        notes = VALUES(notes),
        report_json = VALUES(report_json),
        graph_config_json = VALUES(graph_config_json),
        diagram_url = VALUES(diagram_url),
        diagram_key = VALUES(diagram_key)`,
      [
        pracId,
        userId,
        title,
        simulationId,
        simulationTitle || 'Physics',
        category,
        columnsJson,
        dataJson,
        notes,
        reportJson,
        graphConfigJson,
        diagramUrl || null,
        diagramKey || null,
      ]
    );

    res.status(200).json({
      success: true,
      practical: {
        id: pracId,
        userId,
        title,
        simulationId,
        simulationTitle,
        category,
        columns,
        data,
        notes,
        report,
        graphConfig,
        diagramUrl,
        diagramKey,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save practical', message: err?.message });
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
    res.status(500).json({ error: 'Failed to delete practical', message: err?.message });
  }
});

export default router;
