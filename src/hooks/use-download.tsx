import { useCallback, useState } from "react";
import pLimit from "p-limit";
import streamSaver from "streamsaver";
import saveAs from "file-saver";
import "../lib/zip-stream.js";
import type { DownloadImage, ZipWriter } from "@/types";

interface DownloadOptions {
  onProgress?: (current: number, total: number) => void;
  onError?: (url: string, error: Error) => void;
}

export function useDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    percentage: 0,
  });
  const [error, setError] = useState<Error | null>(null);

  const getFileNameFromUrl = useCallback((url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split("/").pop() || "image";
      return fileName;
    } catch {
      return `image_${Date.now()}`;
    }
  }, []);

  const getImageResponse = useCallback(
    async (
      url: string,
    ): Promise<Response> => {
      try {
        const response = await fetch(url, {
          method: "GET",
          mode: "cors",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `下载失败: ${response.status} ${response.statusText}`,
          );
        }

        return response;
      } catch (error: any) {
        if (error.name === "AbortError") {
          throw new Error("下载已取消");
        }
        console.error(`下载图片 ${url} 失败:`, error);
        throw error;
      }
    },
    [],
  );

  const createZipStream = useCallback(
    async (
      downloadImageList: DownloadImage[],
      zipName: string,
      onProgress: (current: number, total: number) => void,
      onError: (url: string, error: Error) => void,
      signal?: AbortSignal,
    ): Promise<void> => {
      const total = downloadImageList.length;
      let completed = 0;

      const fileStream = streamSaver.createWriteStream(`${zipName}.zip`);
      const writer = fileStream.getWriter();

      const zipReadableStream = window.ZIP({
        async start(zipWriter: ZipWriter) {
          const concurrency = 5;
          const limit = pLimit(concurrency);

          const downloadPromises = downloadImageList.map((downloadImage) =>
            limit(async () => {
              // 检查是否已取消
              if (signal?.aborted) {
                throw new Error("下载已取消");
              }
              const { url } = downloadImage;

              try {
                const res = await getImageResponse(url);
                if (!res.ok) {
                  throw new Error(`下载失败: ${res.status} ${res.statusText}`);
                }
                const stream = () =>
                  res.body as ReadableStream<Uint8Array<ArrayBuffer>>;
                let fileName = getFileNameFromUrl(url);

                zipWriter.enqueue({
                  name: fileName,
                  lastModified: Date.now(),
                  directory: false,
                  stream: stream,
                });
              } catch (error: any) {
                if (error.name !== "AbortError") {
                  console.error(`下载图片 ${url} 失败:`, error);
                  onError(url, error as Error);
                }
              } finally {
                completed++;
                onProgress(completed, total);
              }
            }),
          );

          try {
            await Promise.all(downloadPromises);
            zipWriter.close();
          } catch (error: any) {
            if (error.name !== "AbortError") {
              throw error;
            }
          }
        },
      });

      try {
        const reader = zipReadableStream.getReader();
        while (true) {
          // 检查是否已取消
          if (signal?.aborted) {
            throw new Error("下载已取消");
          }

          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }

        await writer.close();
      } catch (error) {
        console.error("读取zip失败:", error);
        await writer.abort();
        throw error;
      }
    },
    [getFileNameFromUrl],
  );

  const download = useCallback(
    async (
      downloadImageList: DownloadImage[],
      options: DownloadOptions = {},
    ): Promise<void> => {
      const {
        onProgress = () => {},
        onError = () => {},
      } = options;

      // 重置状态
      setError(null);
      setIsDownloading(true);
      setProgress({ current: 0, total: downloadImageList.length, percentage: 0 });

      if (!downloadImageList.length) {
        setError(new Error("没有需要下载的图片"));
        setIsDownloading(false);
        return;
      }

      try {
        // 合并进度回调
        const handleProgress = (current: number, total: number) => {
          const percentage =
            total > 0 ? Math.round((current / total) * 100) : 0;
          setProgress({ current, total, percentage });
          onProgress(current, total);
        };

        // 单张图片直接下载
        if (downloadImageList.length === 1) {
          const url = downloadImageList[0].url;
          try {
            const response = await getImageResponse(url);
            const blob = await response.blob();
            const fileName = getFileNameFromUrl(url);
            saveAs(blob, fileName);
            handleProgress(1, 1);
          } catch (error: any) {
            if (error.name !== "AbortError") {
              onError(url, error as Error);
              throw error;
            }
          }
        } else {
          // 多张图片打包下载
          await createZipStream(
            downloadImageList,
            "zipName",
            handleProgress,
            onError,
          );
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("下载失败:", error);
          setError(error as Error);
        }
      } finally {
        setIsDownloading(false);
      }
    },
    [getImageResponse, createZipStream, getFileNameFromUrl],
  );

  return {
    download,
    isDownloading,
    progress,
    error,
  };
}
