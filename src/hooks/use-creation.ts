import { extractMessages } from "@/utils/json";
import type { Message } from "../types";
import { useEffect, useRef } from "react";

export function useCreation(
  callback: (
    urls: string[],
    conversation_id: string,
    message_id: string
  ) => void
) {
  const prevMessgeId = useRef<Set<string>>(new Set());

  useEffect(() => {
    const _parse = JSON.parse;
    JSON.parse = function (data) {
      let jsonData = _parse(data);
      if (!data.match("creations")) return jsonData;
      let messages = extractMessages(jsonData, "creations") as Message[];
      if (messages.length > 0) {
        messages.forEach((message) => {
          const { creations, conversation_id, message_id } = message;
          const images: string[] = [];
          creations.map((creation) => {
            const rawUrl = creation?.image?.image_ori_raw?.url;
            if (rawUrl) {
              images.push(rawUrl);
              creation.image.image_ori &&
                (creation.image.image_ori.url = rawUrl);
              creation.image.image_preview &&
                (creation.image.image_preview.url = rawUrl);
              creation.image.image_thumb &&
                (creation.image.image_thumb.url = rawUrl);
            }
            return creation;
          });
          images.length > 0 &&
            !prevMessgeId.current.has(message_id) &&
            prevMessgeId.current.add(message_id) &&
            callback(images, conversation_id, message_id);
        });
      }
      return jsonData;
    };
  }, []);
}
