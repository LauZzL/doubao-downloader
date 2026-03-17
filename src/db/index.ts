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
    key: "show_raw",
    value: true,
    label: "对话列表显示无水印原图",
  },
  {
    key: "skip_downloaded",
    value: true,
    label: "跳过已下载的图片",
  },
  {
    key: "download_concurrency",
    value: 5,
    label: "下载图片并发数",
  },
  {
    key: "custom_filename_template",
    value: '${conversation_id}_${message_id}_${index_in_conv}_${creation.image.key}',
    label: "自定义图片文件名",
  },
  {
    key: "create_folder",
    value: false,
    label: "为会话创建文件夹",
  },
];

export class SettingService {
  async initDB() {
    for (const { key, value, label } of SETTING_DEFAULTS) {
      const setting = await db.setting.where("key").equals(key).first();
      if (!setting) {
        await db.setting.add({
          key,
          value,
          label
        });
      }
    }
  }
}
