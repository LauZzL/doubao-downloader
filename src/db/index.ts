import type { Setting } from "@/types";
import { Dexie, type EntityTable } from "dexie";

export const db = new Dexie("DouBaoDownloader") as Dexie & {
  downloaded: EntityTable<{ id: number; url: string }, "id">;
  setting: EntityTable<Setting, "id">;
};
db.version(1).stores({
  downloaded: "++id, url",
  setting: "++id, &key, value",
});


export const SETTING_DEFAULTS: Setting[] = [
  {
    key: "showRaw",
    value: true,
  },
];

export class SettingService {
  async initDB() {
    for (const { key, value } of SETTING_DEFAULTS) {
      const setting = await db.setting.where("key").equals(key).first();
      if (!setting) {
        await db.setting.add({
          key,
          value,
        });
      }
    }
  }
}
