export function average(values) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + (Number(value) || 0), 0) / values.length) : 0;
}

export function classify(text, definitions) {
  const value = String(text || '').toLowerCase();
  return definitions.find((item) => item.terms.some((term) => value.includes(term)))?.key || null;
}

export async function listAll(entity) {
  const unique = new Map();
  for (let skip = 0; skip < 10000; skip += 500) {
    const page = await entity.list('-created_date', 500, skip);
    page.forEach((row) => unique.set(row.id, row));
    if (page.length < 500) break;
  }
  return [...unique.values()];
}