import type { Database, SqlJsStatic } from "sql.js";
import { openDB } from "idb";

let _sql: SqlJsStatic | null = null;
let _db: Database | null = null;

const IDB_NAME = "dailybible";
const IDB_STORE = "assets";
const DB_KEY = "bible.db";

async function getIdb() {
    return openDB(IDB_NAME, 1, {
        upgrade(db) {
            db.createObjectStore(IDB_STORE);
        },
    });
}

async function loadDbBuffer(): Promise<ArrayBuffer> {
    const idb = await getIdb();
    const cached = (await idb.get(IDB_STORE, DB_KEY)) as
        | ArrayBuffer
        | undefined;
    if (cached) return cached;

    const res = await fetch("/bible.db");
    if (!res.ok) throw new Error(`Failed to fetch bible.db: ${res.status}`);
    const buf = await res.arrayBuffer();
    await idb.put(IDB_STORE, buf, DB_KEY);
    return buf;
}

export async function getDb(): Promise<Database> {
    if (_db) return _db;

    if (!_sql) {
        const sqlMod = (await import("sql.js/dist/sql-wasm.js")) as any;
        // console.log('[sqlite] mod keys:', Object.keys(sqlMod), '| default type:', typeof sqlMod.default, '| Module type:', typeof sqlMod.Module);
        const initSqlJs = sqlMod.default ?? sqlMod.Module;
        // console.log('[sqlite] initSqlJs type:', typeof initSqlJs);
        _sql = await initSqlJs({
            locateFile: (file: string) => `/sql.js/${file}`,
        });
    }

    const buf = await loadDbBuffer();
    _db = new _sql.Database(new Uint8Array(buf));
    return _db;
}
