function buildStep(body, stepIndex) {
  const { action, strategy, columns, params: rawParams } = body;

  if (action === 'drop_duplicates') {
    return {
      step_index: stepIndex,
      type: 'drop_duplicates',
      params: rawParams || [{ strategy: strategy || 'auto' }],
    };
  }

  if (action === 'missing_values') {
    const cols = columns || [];
    return {
      step_index: stepIndex,
      type: 'missing_values',
      params: cols.map((column) => ({ column, strategy: strategy || 'mean' })),
    };
  }

  if (action === 'outliers') {
    const cols = columns || [];
    return {
      step_index: stepIndex,
      type: 'outliers',
      params: cols.map((column) => ({ column, strategy: strategy || 'cap' })),
    };
  }

  if (action === 'replace_values') {
    if (rawParams?.length) {
      return { step_index: stepIndex, type: 'replace_values', params: rawParams };
    }
    const cols = columns || [];
    return {
      step_index: stepIndex,
      type: 'replace_values',
      params: cols.map((column) => ({
        column,
        old_value: body.old_value,
        new_value: body.new_value,
      })),
    };
  }

  if (action === 'drop_column') {
    const cols = columns || [];
    return {
      step_index: stepIndex,
      type: 'drop_column',
      params: cols.map((column) => ({ column })),
    };
  }

  throw new Error(`Unsupported cleaning action: ${action}`);
}

module.exports = { buildStep };
