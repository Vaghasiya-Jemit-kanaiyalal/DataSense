const STEP_LABELS = {
  drop_duplicates: 'Drop Duplicates',
  missing_values: 'Fill Missing',
  outliers: 'Cap Outliers',
  replace_values: 'Replace Values',
  drop_column: 'Drop Column',
};

function formatStepHistory(steps) {
  return steps.map((step) => {
    const label = STEP_LABELS[step.type] || step.type;
    const col = step.params?.[0]?.column;
    const strategy = step.params?.[0]?.strategy;
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

async function attachPipelineMeta(datasetService, datasetId, mlPayload) {
  const pipeline = await datasetService.getPipelineByDataset(datasetId);
  const steps = pipeline ? await datasetService.getSteps(pipeline.id) : [];
  return {
    ...mlPayload,
    dataset_id: mlPayload.dataset_id ?? datasetId,
    total_steps: steps.length,
    pipeline_steps: formatStepHistory(steps),
  };
}

module.exports = { attachPipelineMeta, formatStepHistory };
