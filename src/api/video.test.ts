import { afterEach, describe, expect, it, vi } from "vitest";
import { getVideoUrl, getSourceUrlByNodeId } from "./video";

afterEach(() => vi.unstubAllGlobals());

function response(data: unknown) {
  return { ok: true, json: async () => data };
}

describe("video download lookup", () => {
  it("requests a node directly without looking up a conversation or homepage", async () => {
    const fetch = vi.fn().mockResolvedValue(response({
      code: 0, data: { download_infos: [{ main_url: "https://example.test/original.mp4" }] },
    }));
    vi.stubGlobal("fetch", fetch);
    expect(await getSourceUrlByNodeId("  9876543210123456789  ")).toBe("https://example.test/original.mp4");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toContain("/get_download_info?");
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      requests: [{ node_id: "9876543210123456789" }],
    });
  });

  it("preserves the existing vid lookup", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(response({ data: { children: [{ name: "我的创作", id: "folder" }] } }))
      .mockResolvedValueOnce(response({ data: { children: [{ key: "video-key", id: "video-node" }] } }))
      .mockResolvedValueOnce(response({ data: { download_infos: [{ main_url: "https://example.test/video.mp4" }] } }));
    vi.stubGlobal("fetch", fetch);
    expect(await getVideoUrl("video-key")).toBe("https://example.test/video.mp4");
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(JSON.parse(fetch.mock.calls[2][1].body)).toEqual({ requests: [{ node_id: "video-node" }] });
  });

  it("rejects an empty ID before making a request", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(getSourceUrlByNodeId("  ")).rejects.toThrow("请输入作品 nodeId");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("reports permission or deleted-node errors from the API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ code: 403, message: "无权访问作品" })));
    await expect(getSourceUrlByNodeId("missing")).rejects.toThrow("无权访问作品");
  });

  it("rejects a response with no downloadable URL", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ code: 0, data: { download_infos: [] } })));
    await expect(getSourceUrlByNodeId("node")).rejects.toThrow("获取播放地址失败");
  });
});
