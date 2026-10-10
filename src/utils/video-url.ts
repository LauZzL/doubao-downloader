import { getVideoUrl, getSourceUrlByNodeId } from "@/api/video";
import type { ConvMessage } from "@/types";

export function getSourceDownloadUrl(conv: ConvMessage) {
  if (conv.source === "aispace") {
    return getSourceUrlByNodeId(conv.creation.node_id || conv.bot_reply_message_id);
  }
  if (conv.creation.creation_type === "video") return getVideoUrl(conv.creation.vid!);
  return Promise.resolve(conv.creation.image.image_ori_raw.url);
}
