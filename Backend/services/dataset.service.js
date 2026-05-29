const { query } = require('../utils/query');

const ENSURE_SQL = `
CREATE TABLE IF NOT EXISTS datasets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  column_names JSON,
  total_rows INT,
  total_columns INT,
  mime VARCHAR(100),
  size BIGINT,
  is_active TINYINT(1) DEFAULT 0,
  status VARCHAR(32) DEFAULT 'uploaded',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pipelines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dataset_id INT NOT NULL UNIQUE,
  current_step_index INT DEFAULT -1,
  total_steps INT DEFAULT 0,
  status VARCHAR(32) DEFAULT 'idle',
  FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pipeline_steps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pipeline_id INT NOT NULL,
  step_index INT NOT NULL,
  step_type VARCHAR(64) NOT NULL,
  step_params JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE CASCADE,
  UNIQUE KEY unique_step (pipeline_id, step_index)
) ENGINE=InnoDB;
`;

async function hasColumn(table, column) {
  const rows = await query(
    `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column],
  );
  return rows[0].c > 0;
}

async function addColumn(sql) {
  try {
    await query(sql);
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME') throw err;
  }
}

/** Upgrade legacy datasets table created before pipeline architecture. */
async function migrateDatasetsSchema() {
  const tables = await query("SHOW TABLES LIKE 'datasets'");
  if (!tables.length) return;

  if (await hasColumn('datasets', 'original_name') && !(await hasColumn('datasets', 'original_filename'))) {
    await query(
      'ALTER TABLE datasets CHANGE COLUMN original_name original_filename VARCHAR(255) NOT NULL',
    );
  }

  if (await hasColumn('datasets', 'rows_count') && !(await hasColumn('datasets', 'total_rows'))) {
    await query('ALTER TABLE datasets CHANGE COLUMN rows_count total_rows INT NULL');
  }

  if (await hasColumn('datasets', 'columns_count') && !(await hasColumn('datasets', 'total_columns'))) {
    await query('ALTER TABLE datasets CHANGE COLUMN columns_count total_columns INT NULL');
  }

  if (!(await hasColumn('datasets', 'original_filename'))) {
    await addColumn(
      'ALTER TABLE datasets ADD COLUMN original_filename VARCHAR(255) NOT NULL DEFAULT ""',
    );
    if (await hasColumn('datasets', 'filename')) {
      await query('UPDATE datasets SET original_filename = filename WHERE original_filename = ""');
    }
  }

  await addColumn('ALTER TABLE datasets ADD COLUMN column_names JSON NULL');
  await addColumn('ALTER TABLE datasets ADD COLUMN total_rows INT NULL');
  await addColumn('ALTER TABLE datasets ADD COLUMN total_columns INT NULL');
  await addColumn('ALTER TABLE datasets ADD COLUMN mime VARCHAR(100) NULL');
  await addColumn('ALTER TABLE datasets ADD COLUMN size BIGINT NULL');
  await addColumn('ALTER TABLE datasets ADD COLUMN is_active TINYINT(1) DEFAULT 0');
  await addColumn('ALTER TABLE datasets ADD COLUMN status VARCHAR(32) DEFAULT "uploaded"');
  await addColumn(
    'ALTER TABLE datasets ADD COLUMN uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  );
  await addColumn('ALTER TABLE datasets ADD COLUMN storage_path VARCHAR(512) NULL');

  // Fix legacy column types (wrong ENUM/VARCHAR caused "Data truncated")
  if (await hasColumn('datasets', 'status')) {
    await query(
      `ALTER TABLE datasets MODIFY COLUMN status VARCHAR(32) NOT NULL DEFAULT 'uploaded'`,
    );
  }
  if (await hasColumn('datasets', 'is_active')) {
    await query(
      'ALTER TABLE datasets MODIFY COLUMN is_active TINYINT(1) NOT NULL DEFAULT 0',
    );
  }
  if (await hasColumn('datasets', 'mime')) {
    await query('ALTER TABLE datasets MODIFY COLUMN mime VARCHAR(100) NULL');
  }
  if (await hasColumn('datasets', 'original_filename')) {
    await query(
      'ALTER TABLE datasets MODIFY COLUMN original_filename VARCHAR(255) NOT NULL',
    );
  }
}

async function migratePipelinesSchema() {
  const tables = await query("SHOW TABLES LIKE 'pipelines'");
  if (!tables.length) return;
  if (await hasColumn('pipelines', 'status')) {
    await query(
      `ALTER TABLE pipelines MODIFY COLUMN status VARCHAR(32) NOT NULL DEFAULT 'idle'`,
    );
  }
}

async function ensureTables() {
  for (const stmt of ENSURE_SQL.split(';').filter((s) => s.trim())) {
    await query(stmt);
  }
  await migrateDatasetsSchema();
  await migratePipelinesSchema();
}

async function deactivateUserDatasets(userId) {
  if (await hasColumn('datasets', 'is_active')) {
    await query('UPDATE datasets SET is_active = FALSE WHERE user_id = ?', [userId]);
  }
}

async function createDataset({ userId, originalFilename, mime, size }) {
  await deactivateUserDatasets(userId);
  const result = await query(
    `INSERT INTO datasets (user_id, original_filename, mime, size, is_active, status)
     VALUES (?, ?, ?, ?, TRUE, 'uploaded')`,
    [userId, originalFilename, mime, size],
  );
  const datasetId = result.insertId;
  const pipelineResult = await query(
    'INSERT INTO pipelines (dataset_id, current_step_index, total_steps, status) VALUES (?, -1, 0, ?)',
    [datasetId, 'idle'],
  );
  return { datasetId, pipelineId: pipelineResult.insertId };
}

async function updateDatasetMeta(datasetId, { totalRows, totalColumns, columnNames }) {
  await query(
    `UPDATE datasets SET total_rows = ?, total_columns = ?, column_names = ?, status = 'cleaning'
     WHERE id = ?`,
    [totalRows, totalColumns, JSON.stringify(columnNames), datasetId],
  );
}

function normalizeDataset(row) {
  if (!row) return null;
  return {
    ...row,
    id: row.id,
    original_filename: row.original_filename || row.original_name || row.filename || '',
    total_rows: row.total_rows ?? row.rows_count ?? null,
    total_columns: row.total_columns ?? row.columns_count ?? null,
    storage_path: row.storage_path || row.path || null,
    is_active: row.is_active === 1 || row.is_active === true,
  };
}

async function getDataset(userId, datasetId) {
  const rows = await query(
    'SELECT * FROM datasets WHERE id = ? AND user_id = ?',
    [datasetId, userId],
  );
  return normalizeDataset(rows[0]);
}

async function updateStoragePath(datasetId, storagePath) {
  if (await hasColumn('datasets', 'storage_path')) {
    await query('UPDATE datasets SET storage_path = ? WHERE id = ?', [storagePath, datasetId]);
  }
}

async function getActiveDataset(userId) {
  if (await hasColumn('datasets', 'is_active')) {
    const rows = await query(
      'SELECT * FROM datasets WHERE user_id = ? AND is_active = 1 ORDER BY uploaded_at DESC LIMIT 1',
      [userId],
    );
    if (rows[0]) return normalizeDataset(rows[0]);
  }
  const fallback = await query(
    'SELECT * FROM datasets WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 1',
    [userId],
  );
  return normalizeDataset(fallback[0]);
}

async function activateDataset(userId, datasetId) {
  await deactivateUserDatasets(userId);
  await query('UPDATE datasets SET is_active = TRUE WHERE id = ? AND user_id = ?', [
    datasetId,
    userId,
  ]);
}

async function listDatasets(userId) {
  const nameCol = (await hasColumn('datasets', 'original_filename'))
    ? 'original_filename'
    : 'original_name';
  const rowsCol = (await hasColumn('datasets', 'total_rows')) ? 'total_rows' : 'rows_count';
  const colsCol = (await hasColumn('datasets', 'total_columns'))
    ? 'total_columns'
    : 'columns_count';
  const activeCol = (await hasColumn('datasets', 'is_active'))
    ? 'is_active AS isActive'
    : 'FALSE AS isActive';
  const statusCol = (await hasColumn('datasets', 'status'))
    ? 'status'
    : "'uploaded' AS status";

  const rows = await query(
    `SELECT id, ${nameCol} AS name, mime, size, ${rowsCol} AS rows,
      ${colsCol} AS columns, ${activeCol}, ${statusCol}, uploaded_at AS uploadedAt
     FROM datasets WHERE user_id = ? ORDER BY uploaded_at DESC`,
    [userId],
  );
  return rows.map((row) => ({
    ...row,
    isActive: row.isActive === 1 || row.isActive === true,
  }));
}

async function getPipelineByDataset(datasetId) {
  const rows = await query('SELECT * FROM pipelines WHERE dataset_id = ?', [datasetId]);
  return rows[0] || null;
}

async function getSteps(pipelineId) {
  const rows = await query(
    'SELECT step_index, step_type, step_params FROM pipeline_steps WHERE pipeline_id = ? ORDER BY step_index ASC',
    [pipelineId],
  );
  return rows.map((row) => ({
    step_index: row.step_index,
    type: row.step_type,
    params: typeof row.step_params === 'string' ? JSON.parse(row.step_params) : row.step_params,
  }));
}

async function saveStep(pipelineId, step) {
  await query(
    'INSERT INTO pipeline_steps (pipeline_id, step_index, step_type, step_params) VALUES (?, ?, ?, ?)',
    [pipelineId, step.step_index, step.type, JSON.stringify(step.params)],
  );
  await query(
    'UPDATE pipelines SET current_step_index = ?, total_steps = ?, status = ? WHERE id = ?',
    [step.step_index, step.step_index + 1, 'idle', pipelineId],
  );
}

async function deleteLastStep(pipelineId) {
  const rows = await query(
    'SELECT id, step_index FROM pipeline_steps WHERE pipeline_id = ? ORDER BY step_index DESC LIMIT 1',
    [pipelineId],
  );
  if (!rows.length) return null;
  const last = rows[0];
  await query('DELETE FROM pipeline_steps WHERE id = ?', [last.id]);
  const remaining = await query(
    'SELECT MAX(step_index) AS max_idx FROM pipeline_steps WHERE pipeline_id = ?',
    [pipelineId],
  );
  const maxIdx = remaining[0]?.max_idx;
  const current = maxIdx == null ? -1 : maxIdx;
  const total = current + 1;
  await query(
    'UPDATE pipelines SET current_step_index = ?, total_steps = ?, status = ? WHERE id = ?',
    [current, total, 'idle', pipelineId],
  );
  return last.step_index;
}

module.exports = {
  ensureTables,
  createDataset,
  updateDatasetMeta,
  updateStoragePath,
  getDataset,
  getActiveDataset,
  activateDataset,
  listDatasets,
  getPipelineByDataset,
  getSteps,
  saveStep,
  deleteLastStep,
};
