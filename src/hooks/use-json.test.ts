import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { extractAispaceCreations, isAispaceResponse, useJson } from "./use-json";

afterEach(() => {
  vi.restoreAllMocks();
});

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

describe("conversation rich media extraction", () => {
  it("captures video resources from downlink messages by vid without using download_url", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useJson({ callback }));
    const response = {
      cmd: 3100,
      downlink_body: {
        pull_singe_chain_downlink_body: {
          messages: [
            {
              conversation_id: "conversation-1",
              message_id: "message-1",
              index_in_conv: "8",
              create_time: "1791616320",
              bot_reply_message_id: "reply-1",
              tts_content: "Video generated",
              content_block: [
                {
                  block_type: 10084,
                  content: {
                    rich_media_layout_block: {
                      media: [
                        {
                          type: 6,
                          creation: {
                            type: 2,
                            video: {
                              vid: "video-vid",
                              download_url: "https://example.test/direct.mp4",
                              cover: {
                                key: "video-cover-key",
                                image_thumb: { url: "https://example.test/cover.jpg" },
                              },
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    };

    act(() => {
      JSON.parse(JSON.stringify(response));
    });

    expect(callback).toHaveBeenCalledWith([
      {
        source: "conversation",
        index_in_conv: 8,
        bot_reply_message_id: "reply-1",
        tts_content: "Video generated",
        conversation_id: "conversation-1",
        message_id: "message-1",
        create_time: 1791616320000,
        creation: {
          creation_type: "video",
          vid: "video-vid",
          image: {
            key: "video-cover-key",
            image_ori_raw: { url: "https://example.test/cover.jpg" },
            gen_params: "",
          },
        },
      },
    ]);
    expect(JSON.stringify(callback.mock.calls[0][0])).not.toContain("direct.mp4");
    unmount();
  });
});
