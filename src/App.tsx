import { useState, useEffect } from "react";
import { Indicator } from "./components/Indicator";
import { Home } from ".//Home";
import { useCreation } from "./hooks/use-creation";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import downloadImagesAsZip from "./utils/download";
import { DownloadProgress } from "./components/DownloadProgress";
import { checkVersion } from "./utils/check-version";

const DOWNLOADED_IMAGES_KEY = "doubao-downloaded-images";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [downloadedImages, setDownloadedImages] = useState<Set<string>>(
    new Set()
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({
    current: 0,
    total: 0,
  });

  // 从 localStorage 加载已下载的图片记录
  useEffect(() => {
    try {
      // 检查新版本
      checkVersion();
      const saved = localStorage.getItem(DOWNLOADED_IMAGES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setDownloadedImages(new Set(parsed));
      }
    } catch (error) {
      console.error("加载已下载图片记录失败:", error);
    }
  }, []);

  // 保存已下载的图片记录到 localStorage
  const saveDownloadedImages = (urls: string[]) => {
    const newDownloaded = new Set([...downloadedImages, ...urls]);
    setDownloadedImages(newDownloaded);
    try {
      localStorage.setItem(
        DOWNLOADED_IMAGES_KEY,
        JSON.stringify([...newDownloaded])
      );
    } catch (error) {
      console.error("保存已下载图片记录失败:", error);
    }
  };

  // 重置已下载的图片记录
  const resetDownloadedImages = () => {
    setDownloadedImages(new Set());
    try {
      localStorage.removeItem(DOWNLOADED_IMAGES_KEY);
      toast.success("重置成功", {
        description: "已清除所有下载记录",
      });
    } catch (error) {
      console.error("重置下载记录失败:", error);
      toast.error("重置失败", {
        description: "清除下载记录时出错",
      });
    }
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

  useCreation((urls) => {
    const newImages = urls.filter((url) => !images.includes(url));
    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
      toast("🎉 有新图片", {
        description: `获取到${newImages.length}张图片`,
        action: {
          label: "一键下载",
          onClick: () => {
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
        urls={images}
        downloadedImages={downloadedImages}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onDownload={download}
        isDownloading={isDownloading}
        onResetDownloaded={resetDownloadedImages}
      ></Home>
      <Toaster />
      {isDownloading && (
        <DownloadProgress text={`正在下载... ${downloadProgress.current}/${downloadProgress.total}`} />
      )}
    </div>
  );
}

export default App;
