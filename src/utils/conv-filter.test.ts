import { describe, expect, it } from "vitest";
import type { ConvMessage } from "@/types";
import { matchesConvScope } from "./conv-filter";

const message = (source?: ConvMessage["source"], conversation_id = "conversation"): ConvMessage => ({
  source,
  index_in_conv: 1,
  bot_reply_message_id: "reply",
  tts_content: "content",
  conversation_id,
  message_id: "message",
  create_time: 1,
  creation: {
    creation_type: "image",
    image: { image_ori_raw: { url: "https://example.test/image.jpg" }, key: "image", gen_params: "" },
  },
});

describe("conversation filter scopes", () => {
  it("keeps aispace creations out of all conversations", () => {
    expect(matchesConvScope(message("aispace"), "-1")).toBe(false);
    expect(matchesConvScope(message(undefined), "-1")).toBe(true);
  });

  it("matches aispace independently from conversation IDs", () => {
    expect(matchesConvScope(message("aispace", "some-conversation"), "aispace")).toBe(true);
    expect(matchesConvScope(message("aispace"), "conversation")).toBe(false);
    expect(matchesConvScope(message(undefined), "conversation")).toBe(true);
  });
});
