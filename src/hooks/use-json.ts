import { useEffect, useRef } from "react";
import type { ConvMessage } from "@/types";

interface UseJsonProps {
  showRaw?: boolean;
  callback: (messages: ConvMessage[]) => void;
}

function findAllKeysInJson(obj: object, key: string): any[] {
  const results: any[] = [];
  function search(current: any) {
    if (current && typeof current === "object") {
      if (
        !Array.isArray(current) &&
        Object.prototype.hasOwnProperty.call(current, key)
      ) {
        results.push(current[key]);
      }
      const items = Array.isArray(current) ? current : Object.values(current);
      for (const item of items) {
        search(item);
      }
    }
  }
  search(obj);
  return results;
}

export function useJson({ showRaw = true, callback }: UseJsonProps) {
  const prevMessageIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    const _parse = JSON.parse;
    window.origin_parse = JSON.parse;
    JSON.parse = function (text: string) {
      let jsonData = _parse(text);
      if (!text.includes("creations") || !text.includes("conversation_id"))
        return jsonData;
      // TODO 适配实时对话生成模式
      let messageList = findAllKeysInJson(jsonData, "messages");
      const newConv: ConvMessage[] = [];
      messageList.map((messages) =>
        messages.map((message: any) => {
          // 消息ID
          const message_id = message.message_id;
          if (!prevMessageIds.current.has(message_id)) {
            prevMessageIds.current.add(message_id);
            // 回复的消息ID
            const bot_reply_message_id = message.bot_reply_message_id;
            // 消息列表索引
            const index_in_conv = Number(message.index_in_conv);
            // 会话ID
            const conversation_id = message.conversation_id;
            // 消息文本内容
            const tts_content = message.tts_content;
            // 创建时间
            const create_time = message.create_time * 1000;
            let creationList = findAllKeysInJson(message, "creations");
            if (creationList.length > 0) {
              creationList.map((creations) =>
                creations.map((creation: any) => {
                  let image = creation.image;
                  const rawImage = image?.image_ori_raw?.url;
                  // 展示原图
                  if (showRaw && rawImage) {
                    image.image_ori && (image.image_ori.url = rawImage);
                    image.image_preview && (image.image_preview.url = rawImage);
                    image.image_thumb && (image.image_thumb.url = rawImage);
                  }
                  rawImage &&
                    newConv.push({
                      index_in_conv,
                      bot_reply_message_id,
                      tts_content,
                      conversation_id,
                      message_id,
                      create_time,
                      creation: {
                          image: {
                            key: image.key,
                            image_ori_raw: image.image_ori_raw,
                            gen_params: image.gen_params.prompt,
                          },
                        },
                    });
                }),
              );
            } else {
              newConv.push({
                index_in_conv,
                bot_reply_message_id,
                tts_content,
                conversation_id,
                message_id,
                create_time,
              });
            }
          }
        }),
      );
      callback(newConv);
      return jsonData;
    };
    return () => {
      JSON.parse = window.origin_parse;
    };
  }, []);
}
