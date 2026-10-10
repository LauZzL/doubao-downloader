import { describe, expect, it } from "vitest";
import { extractAispaceCreations, isAispaceResponse } from "./use-json";

describe("aispace creation extraction", () => {
  it("recognizes paginated responses when node_info is null", () => {
    expect(isAispaceResponse({
      data: {
        node_info: null,
        children: [{ id: "page-2-node", node_type: 4 }],
        path: [{ name: "我的创作", content: { directory_type: 5 } }],
      },
    })).toBe(true);
    expect(isAispaceResponse({ data: { children: [{ id: "other-node" }] } })).toBe(false);
  });

  it("maps image and video children into independent ConvMessages", () => {
    const messages = extractAispaceCreations([
      {
        id: "image-node",
        name: "image.png",
        key: "image-key",
        node_type: 4,
        conversation_id: "image-conversation",
        create_time: 100,
        node_cover: { thumbnail_view: { cover_url: "https://example.test/image.jpg" } },
      },
      {
        id: "video-node",
        name: "video.mp4",
        key: "video-vid",
        node_type: 6,
        conversation_id: "video-conversation",
        create_time: 200,
        node_cover: { list_view: { cover_url: "https://example.test/video.jpg" } },
      },
    ]);

    expect(messages).toEqual([
      expect.objectContaining({
        source: "aispace",
        message_id: "image-node",
        conversation_id: "image-conversation",
        create_time: 100000,
        creation: expect.objectContaining({
          creation_type: "image",
          image: expect.objectContaining({
            key: "image-key",
            image_ori_raw: { url: "https://example.test/image.jpg" },
          }),
        }),
      }),
      expect.objectContaining({
        source: "aispace",
        message_id: "video-node",
        conversation_id: "video-conversation",
        create_time: 200000,
        creation: expect.objectContaining({
          creation_type: "video",
          vid: "video-vid",
          node_id: "video-node",
          image: expect.objectContaining({
            key: "video-vid",
            image_ori_raw: { url: "https://example.test/video.jpg" },
          }),
        }),
      }),
    ]);
  });
});
