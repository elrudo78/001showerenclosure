import { DatabaseSync } from 'node:sqlite'
import { readdirSync, readFileSync } from 'node:fs'

// A stand-in for the D1 database: the real migration files on an in-memory SQLite (the same engine D1 uses).
export function makeDb() {
  const sqlite = new DatabaseSync(':memory:')
  for (const f of readdirSync(new URL('../migrations', import.meta.url)).sort()) sqlite.exec(readFileSync(new URL(`../migrations/${f}`, import.meta.url), 'utf8'))
  const db = {
    sqlite,
    prepare(sql) {
      const st = sqlite.prepare(sql)
      let params = []
      const o = {
        bind: (...p) => ((params = p), o),
        first: async () => st.get(...params) ?? null,
        run: async () => ({ meta: { changes: st.run(...params).changes } }),
      }
      return o
    },
  }
  return db
}
