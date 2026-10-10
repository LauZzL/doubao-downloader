import { describe, expect, it, vi } from "vitest";
import type { ConvMessage } from "@/types";

const mocks = vi.hoisted(() => ({ getVideoUrl: vi.fn(), getSourceUrlByNodeId: vi.fn() }));
vi.mock("@/api/video", () => mocks);

import { getSourceDownloadUrl } from "./video-url";

const video = (source?: ConvMessage["source"]): ConvMessage => ({
  source,
  index_in_conv: 0,
  bot_reply_message_id: "node-id",
  tts_content: "video",
  conversation_id: "conversation",
  message_id: "message",
  create_time: 1,
  creation: {
    creation_type: "video",
    vid: "video-vid",
    node_id: "node-id",
    image: { image_ori_raw: { url: "https://example.test/cover.jpg" }, key: "video", gen_params: "" },
  },
});

describe("video download URL lookup", () => {
  it("uses the aispace node ID for aispace videos", async () => {
    mocks.getSourceUrlByNodeId.mockResolvedValue("https://example.test/aispace.mp4");

    await expect(getSourceDownloadUrl(video("aispace"))).resolves.toBe("https://example.test/aispace.mp4");
    expect(mocks.getSourceUrlByNodeId).toHaveBeenCalledWith("node-id");
    expect(mocks.getVideoUrl).not.toHaveBeenCalled();
  });

  it("keeps using vid lookup for conversation videos", async () => {
    mocks.getVideoUrl.mockResolvedValue("https://example.test/conversation.mp4");

    await expect(getSourceDownloadUrl(video("conversation"))).resolves.toBe("https://example.test/conversation.mp4");
    expect(mocks.getVideoUrl).toHaveBeenCalledWith("video-vid");
    expect(mocks.getSourceUrlByNodeId).not.toHaveBeenCalled();
  });

  it("uses the aispace node ID for aispace images", async () => {
    mocks.getSourceUrlByNodeId.mockResolvedValue("https://example.test/aispace.png");
    const image = { ...video("aispace"), creation: { ...video("aispace").creation, creation_type: "image" as const } };

    await expect(getSourceDownloadUrl(image)).resolves.toBe("https://example.test/aispace.png");
    expect(mocks.getSourceUrlByNodeId).toHaveBeenCalledWith("node-id");
  });
});
