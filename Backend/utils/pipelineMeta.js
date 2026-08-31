const STEP_LABELS = {
  drop_duplicates: 'Drop Duplicates',
  missing_values: 'Fill Missing',
  outliers: 'Cap Outliers',
  replace_values: 'Replace Values',
  drop_column: 'Drop Column',
  encoding: 'Encoding',
  create_feature: 'Create Feature',
};

function formatStepHistory(steps) {
  return steps.map((step) => {
    const label = STEP_LABELS[step.type] || step.type;
    const col = step.params?.[0]?.column || step.params?.[0]?.new_column || step.params?.[0]?.name;
    const strategy = step.params?.[0]?.strategy || step.params?.[0]?.formula || step.params?.[0]?.operator;
    let detail = label;
    if (col) detail = `${label} · ${col}`;
    if (strategy) detail += ` (${strategy})`;
    return {
      step_index: step.step_index,
      type: step.type,
      label,
      detail,
    };
  });
}

async function attachPipelineMeta(datasetService, datasetId, mlPayload, meta = null) {
  const pipeline = await datasetService.getPipelineByDataset(datasetId);
  const steps = pipeline ? await datasetService.getSteps(pipeline.id) : [];
  const status = meta?.status || 'uploaded';
  const finalized = status === 'finalized' || pipeline?.status === 'finalized';

  let original_filename = meta?.original_filename;
  if (!original_filename) {
    try {
      const dbMeta = await datasetService.getDataset(null, datasetId);
      original_filename = dbMeta?.original_filename;
    } catch (err) {
      console.error('Error fetching dataset in attachPipelineMeta:', err);
    }
  }

  return {
    ...mlPayload,
    dataset_id: mlPayload.dataset_id ?? datasetId,
    total_steps: steps.length,
    pipeline_steps: formatStepHistory(steps),
    status,
    finalized,
    pipeline_locked: finalized,
    original_filename: original_filename || mlPayload.original_filename || '',
  };
}

module.exports = { attachPipelineMeta, formatStepHistory };
