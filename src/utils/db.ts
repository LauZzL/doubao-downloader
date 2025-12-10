import { Dexie, type EntityTable } from "dexie";

export const db = new Dexie("DouBaoDownloader") as Dexie & {
    downloaded: EntityTable<{ id: number; url: string }, 'id'>;
    setting: EntityTable<{ id: number; key: string; value: any }, 'id'>;
};
db.version(1).stores({
  downloaded: "++id, url",
  setting: "id, key, value",
});
