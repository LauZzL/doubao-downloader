import { Message } from "@/types";

export function extractMessages(obj: object, key: string): any[] {
  const results: Message[] = [];
  function search(current: any, latest_conversation_id: string = "", latest_message_id: string = "") {
    if (current && typeof current === "object") {
      const conversation_id = current?.conversation_id || latest_conversation_id;
      const message_id = current?.message_id || latest_message_id;
      if (
        !Array.isArray(current) &&
        Object.prototype.hasOwnProperty.call(current, key)
      ) {
        // 生成图片时response中不含有conversation_id
        message_id && results.push({
          conversation_id,
          message_id,
          creations: current[key],
        });
      }
      const items = Array.isArray(current) ? current : Object.values(current);
      for (const item of items) {
        search(item, conversation_id, message_id);
      }
    }
  }
  search(obj);
  return results;
}