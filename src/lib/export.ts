/**
 * CSV export utility — converts array of objects to downloadable CSV file.
 */

export function exportCSV<T extends object>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[],
) {
  if (data.length === 0) return

  const cols = columns ?? (Object.keys(data[0]) as (keyof T)[]).map((k) => ({
    key: k,
    header: String(k),
  }))

  const header = cols.map((c) => escapeCSV(c.header)).join(',')
  const rows = data.map((row) =>
    cols.map((c) => escapeCSV(String(row[c.key] ?? ''))).join(','),
  )

  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
