import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import VideoRecovery from "./VideoRecovery";

const mocks = vi.hoisted(() => ({ lookup: vi.fn(), download: vi.fn(), success: vi.fn(), error: vi.fn() }));
vi.mock("@/api/video", () => ({ getVideoUrlByNodeId: mocks.lookup }));
vi.mock("@/hooks/use-download", () => ({ useDownload: () => ({ download: mocks.download }) }));
vi.mock("@douyinfe/semi-ui-19", () => ({
  Button: ({ children, onClick }: { children: ReactNode; onClick: () => void }) => <button onClick={onClick}>{children}</button>,
  Input: ({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled: boolean }) =>
    <input aria-label="作品 nodeId" value={value} disabled={disabled} onChange={e => onChange(e.target.value)} />,
  Modal: ({ visible, children, onOk, onCancel, okButtonProps, confirmLoading }: {
    visible: boolean; children: ReactNode; onOk: () => void; onCancel: () => void;
    okButtonProps: { disabled: boolean }; confirmLoading: boolean;
  }) => visible ? <div role="dialog">
    {children}
    <button disabled={okButtonProps.disabled || confirmLoading} onClick={onOk}>下载视频</button>
    <button onClick={onCancel}>取消</button>
  </div> : null,
  Toast: { success: mocks.success, error: mocks.error },
}));

beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);

function openRecovery(id: string) {
  render(<VideoRecovery />);
  fireEvent.click(screen.getByText("按作品ID下载视频"));
  fireEvent.change(screen.getByLabelText("作品 nodeId"), { target: { value: id } });
}

describe("manual video recovery", () => {
  it("can download with no captured conversation and closes only after saving", async () => {
    mocks.lookup.mockResolvedValue("https://example.test/video.mp4");
    mocks.download.mockImplementation(async (_items, options) => options.onSave());
    openRecovery("  9876543210123456789  ");
    fireEvent.click(screen.getByText("下载视频"));
    await waitFor(() => expect(mocks.success).toHaveBeenCalled());
    expect(mocks.lookup).toHaveBeenCalledWith("9876543210123456789");
    expect(mocks.download.mock.calls[0][0][0]).toMatchObject({ url: "https://example.test/video.mp4", filename: "recovered-video.mp4" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does not send a blank ID", () => {
    openRecovery("  ");
    fireEvent.click(screen.getByText("下载视频"));
    expect(mocks.lookup).not.toHaveBeenCalled();
  });

  it("keeps the dialog open for retry after an API error", async () => {
    mocks.lookup.mockRejectedValue(new Error("无权访问作品"));
    openRecovery("node");
    fireEvent.click(screen.getByText("下载视频"));
    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith("无权访问作品"));
    expect(mocks.download).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeNull();
  });

  it("does not report success when the download fails", async () => {
    mocks.lookup.mockResolvedValue("https://example.test/video.mp4");
    mocks.download.mockImplementation(async (_items, options) => options.onError("url", new Error("下载失败")));
    openRecovery("node");
    fireEvent.click(screen.getByText("下载视频"));
    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith("下载失败"));
    expect(mocks.success).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeNull();
  });
});
