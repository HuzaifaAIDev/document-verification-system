export default function DataTable({ columns, rows, empty = 'No records' }) {
  return (
    <div className="overflow-x-auto card">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800/50 text-left text-xs uppercase text-slate-500 tracking-wider">
          <tr>{columns.map((c) => <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-slate-400">{empty}</td></tr>
          ) : rows.map((row, i) => (
            <tr key={row.id ?? i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 text-slate-700 dark:text-slate-200">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
