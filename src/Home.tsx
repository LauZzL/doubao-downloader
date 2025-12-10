import { useState, useCallback } from "react";
import { ImageSelector } from "./components/ImageSelector";
import CheckBox from "./components/CheckBox";
import { db } from "./utils/db";
import { useLiveQuery } from "dexie-react-hooks";

interface HomeProps {
  urls: string[];
  downloadedImages: Set<string>;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (urls: string[]) => void;
  isDownloading: boolean;
  onResetDownloaded: () => void;
}

export const Home = (props: HomeProps) => {
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const setting = useLiveQuery(() => db.setting.toArray(), []) || [];

  const handleOnSelectChange = useCallback((selected: string[]) => {
    setSelectedUrls(selected);
  }, []);

  const downloadSelected = async () => {
    if (props.isDownloading) return;
    await props.onDownload(selectedUrls);
    // 下载完成后清除勾选
    setSelectedUrls([]);
  };

  const downloadAll = async () => {
    if (props.isDownloading) return;
    await props.onDownload(props.urls);
    // 下载完成后清除勾选
    setSelectedUrls([]);
  };

  // 勾选所有未下载的图片
  const selectUndownloaded = () => {
    const undownloaded = props.urls.filter((url) => !props.downloadedImages.has(url));
    setSelectedUrls(undownloaded);
  };

  // 取消所有勾选
  const unselectAll = () => {
    setSelectedUrls([]);
  };

  // 统计未下载的图片数量
  const undownloadedCount = props.urls.filter(
    (url) => !props.downloadedImages.has(url)
  ).length;

  // 重置下载记录
  const handleResetDownloaded = () => {
    if (window.confirm("确定要清除所有下载记录吗？此操作不可恢复。")) {
      props.onResetDownloaded();
    }
  };

  return (
    <div className={`dd-home ${props.isOpen ? "show" : ""}`}>
      <div
        onClick={props.onClose}
        className="dd-mask absolute opacity-50 top-0 h-full w-full inset-0 bg-black z-88888"
      />
      <div className="dd-home-content w-[80vw] h-[70vh] lg:w-[800px] lg:h-[600px]">
        <div className="dd-action-btns">
          <div className="flex items-center gap-2 flex-wrap overflow-x-auto">
            <div className="flex gap-2">
              <button
                onClick={downloadAll}
                className="dd-btn primary"
                disabled={props.isDownloading}
              >
                {props.isDownloading
                  ? "下载中..."
                  : `下载所有 (${props.urls.length})`}
              </button>
              <button
                onClick={downloadSelected}
                className="dd-btn orange"
                disabled={selectedUrls.length === 0 || props.isDownloading}
              >
                下载选中 ({selectedUrls.length})
              </button>
              <button
                onClick={selectUndownloaded}
                className="dd-btn"
                disabled={undownloadedCount === 0}
                style={{
                  backgroundColor:
                    undownloadedCount > 0 ? "#10b981" : "#9ca3af",
                  color: "white",
                }}
              >
                勾选未下载 ({undownloadedCount})
              </button>
              <button
                onClick={unselectAll}
                className="dd-btn"
                disabled={selectedUrls.length === 0}
                style={{
                  backgroundColor:
                    selectedUrls.length > 0 ? "#f59e0b" : "#9ca3af",
                  color: "white",
                }}
                title="清除所有勾选"
              >
                取消勾选 ({selectedUrls.length})
              </button>
              <button
                onClick={handleResetDownloaded}
                className="dd-btn"
                disabled={props.downloadedImages.size === 0}
                style={{
                  backgroundColor:
                    props.downloadedImages.size > 0 ? "#ef4444" : "#9ca3af",
                  color: "white",
                }}
                title="清除所有下载记录"
              >
                重置记录
              </button>
            </div>
          </div>
        </div>
        <div className="dd-action-btns">  
          <CheckBox id="1" name="1" label="下载时按展示顺序下载" checked={
            setting.find((item) => item.key === "download_order")?.value as boolean || false
          } onChange={
            (checked) => {
              db.setting.put({
                id: 1,
                key: "download_order",
                value: checked,
              });
            }
          }></CheckBox>
        </div>
        <div className="dd-images-container">
          <ImageSelector
            images={props.urls}
            downloadedImages={props.downloadedImages}
            selectedUrls={selectedUrls}
            onSelectChange={handleOnSelectChange}
          />
        </div>
      </div>
    </div>
  );
};
