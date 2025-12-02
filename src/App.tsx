import { useState, useEffect } from "react";
import { Indicator } from "./components/Indicator";
import { Home } from ".//Home";
import { useCreation } from "./hooks/use-creation";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import downloadImagesAsZip from "./utils/download";
import { DownloadProgress } from "./components/DownloadProgress";
import { checkVersion } from "./utils/check-version";
import { db } from "./utils/db";
import { useLiveQuery } from "dexie-react-hooks";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{
    urls: string[];
    message_id: string;
    conversation_id: string;
  }[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({
    current: 0,
    total: 0,
  });

  // 获取已下载的图片记录
  const downloaded = new Set(
    useLiveQuery(() => db.downloaded.toArray(), [])?.map((item) => item.url)
  );

  useEffect(() => {
    try {
      // 检查新版本
      checkVersion();
    } catch (error) {
      console.error("检查新版本异常:", error);
    }
  }, []);

  // 保存已下载的图片记录
  const saveDownloadedImages = (urls: string[]) => {
    db.downloaded.bulkAdd(urls.map((url) => ({ url }))).catch((error) => {
      console.error("保存已下载图片记录失败:", error);
      toast.error("保存已下载图片记录失败", {
        description: error instanceof Error ? error.message : "未知错误",
      });
    });
  };

  // 重置已下载的图片记录
  const resetDownloadedImages = () => {
    db.downloaded.clear().catch((error) => {
      console.error("重置已下载图片记录失败:", error);
      toast.error("重置已下载图片记录失败", {
        description: error instanceof Error ? error.message : "未知错误",
      });
    });
  };

  const download = async (urls: string[]) => {
    if (isDownloading) {
      toast.warning("正在下载中", {
        description: "请等待当前下载完成",
      });
      return;
    }

    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: urls.length });

    try {
      await downloadImagesAsZip(urls, {
        zipName: document.title,
        onProgress: (current, total) => {
          setDownloadProgress({ current, total });
        },
        onError: (url, error) => {
          console.error(`下载图片${url}失败:`, error);
          toast.error("下载失败", {
            description: `图片下载失败: ${error.message}`,
          });
        },
      });

      // 下载成功后记录这些图片
      saveDownloadedImages(urls);

      toast.success("下载完成", {
        description: `成功下载 ${urls.length} 张图片`,
      });
    } catch (error) {
      console.error("下载失败:", error);
      toast.error("下载失败", {
        description: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  useCreation((urls, conversation_id, message_id) => {
    const newMessages = messages.find((item) => item.message_id === message_id) ?? { urls, message_id, conversation_id };
    if (newMessages) {
      setMessages((prev) => [...prev, newMessages]);
      toast("🎉 有新图片", {
        description: `获取到${newMessages.urls.length}张图片`,
        action: {
          label: "一键下载",
          onClick: () => {
            const newImages = newMessages.urls.filter(
              (url) => !downloaded.has(url)
            );
            download(newImages);
          },
        },
      });
    }
  });

  return (
    <div>
      <Indicator onClick={() => setIsOpen(!isOpen)} />
      <Home
        messages={messages}
        downloadedImages={downloaded}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onDownload={download}
        isDownloading={isDownloading}
        onResetDownloaded={resetDownloadedImages}
      ></Home>
      <Toaster />
      {isDownloading && (
        <DownloadProgress
          text={`正在下载... ${downloadProgress.current}/${downloadProgress.total}`}
        />
      )}
    </div>
  );
}

export default App;
