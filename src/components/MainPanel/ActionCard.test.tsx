import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ConvMessage } from "@/types";
import { ConvContext } from "@/context/ConvContext";
import ActionCard from "./ActionCard";

vi.mock("./VideoRecovery", () => ({ default: () => <button>按作品ID下载视频</button> }));

vi.mock("@douyinfe/semi-ui-19", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick} type="button">{children}</button>
  ),
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DatePicker: () => <input aria-label="日期范围" />,
  Radio: ({ children, value }: { children: React.ReactNode; value: string }) => <span data-value={value}>{children}</span>,
  RadioGroup: ({ children, onChange }: { children: React.ReactNode; onChange?: (event: { target: { value: string } }) => void }) => (
    <div>
      {children}
      <button onClick={() => onChange?.({ target: { value: "video" } })} type="button">视频 1</button>
    </div>
  ),
  Select: Object.assign(
    ({ children }: { children: React.ReactNode }) => <select>{children}</select>,
    { Option: ({ children }: { children: React.ReactNode }) => <option>{children}</option> },
  ),
  Space: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const conv = (creation_type: "image" | "video", message_id: string): ConvMessage => ({
  index_in_conv: 1,
  bot_reply_message_id: message_id,
  tts_content: message_id,
  conversation_id: "conversation",
  message_id,
  create_time: 1,
  creation: {
    creation_type,
    image: { image_ori_raw: { url: `https://${message_id}` }, key: message_id, gen_params: "" },
  },
});

describe("ActionCard", () => {
  it("renders media counts and changes the active media type", () => {
    const changeMediaType = vi.fn();
    const convMessage = [conv("image", "image-1"), conv("video", "video-1"), conv("image", "image-2")];

    render(
      <ConvContext.Provider value={{
        convMessage,
        selectKeys: [],
        handleSelect: vi.fn(),
        handleDownload: vi.fn(),
        handlePlay: vi.fn(),
        handleDelete: vi.fn(),
        handleDownloadAll: vi.fn(),
        handleDownloadSelected: vi.fn(),
      }}>
        <ActionCard
          changeConv={vi.fn()}
          changeMediaType={changeMediaType}
          changeTimeRange={vi.fn()}
          mediaCounts={{ all: 3, image: 2, video: 1 }}
          mediaType="all"
        />
      </ConvContext.Provider>,
    );

    expect(screen.getByText("全部 3")).toBeTruthy();
    expect(screen.getByText("图片 2")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "视频 1" }));
    expect(changeMediaType).toHaveBeenCalledWith("video");
  });
});
