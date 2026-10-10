import { useCallback, useEffect, useRef, useState } from "react";
import { Indicator } from "./components/Indicator";
import MainPanel from "./components/MainPanel/MainPanel";
import { useJson } from "./hooks/use-json";
import { ConvFilter, ConvMessage, Creation, Setting, SettingKey } from "./types";
import { ConvContext } from "./context/ConvContext";
import { ConvFilterContext } from "./context/ConvFilterContext";
import { useDownload } from "./hooks/use-download";
import { Button, Notification, Toast, Typography } from "@douyinfe/semi-ui-19";
import ProgressModal from "./components/ProgressModal";
import { db, SettingService } from "./db";
import SettingModal from "./components/SettingModal";
import { SettingContext } from "./context/SettingContext";
import { useLiveQuery } from "dexie-react-hooks";
import { completeSuffix, replaceTemplate } from "./utils/common";
import { getVideoUrl } from "@/api/video";
import { matchesShortcut } from "@/utils/shortcut";
import { filterConvsByMediaType } from "@/utils/media-filter";
import { filterDeletedConvs } from "@/utils/deleted-media";
import { getSourceDownloadUrl } from "@/utils/video-url";
import { useDeletedMediaKeys } from "@/hooks/use-deleted-media-keys";
import { matchesConvScope } from "@/utils/conv-filter";

function settingValue<T>(settings: Setting[], key: SettingKey, fallback: T): T {
  return (settings.find((item) => item.key === key)?.value as T | undefined) ?? fallback;
}

function App() {
  const [isOpenMainPanel, setIsOpenMainPanel] = useState(false);
  const [isOpenSetting, setIsOpenSetting] = useState(false);
  const [convMessageList, setConvMessageList] = useState<ConvMessage[]>([]);
  const [selectKeys, setSelectKeys] = useState<string[]>([]);
  const [convFilter, setConvFilter] = useState<ConvFilter>({
    showConvId: "-1",
    currentPage: 1,
    pageSize: 12,
    mediaType: "all",
  });
  const deletedKeys = useDeletedMediaKeys();
  const setting =
    useLiveQuery(() => db.setting.toArray(), []) || ([] as Setting[]);
  const showCaptureNotification = settingValue(setting, "show_capture_notification", true);
  const hideIndicator = settingValue(setting, "hide_indicator", false);
  const panelShortcut = settingValue(setting, "panel_shortcut", "Alt + D");
  const showCaptureNotificationRef = useRef(showCaptureNotification);
  showCaptureNotificationRef.current = showCaptureNotification;

  const { Text } = Typography;

  useEffect(() => {
    Notification.config({
      position: "bottomRight",
    });
    const settingService = new SettingService();
    settingService.initDB().catch((err) => {
      console.error(`init db error: `, err);
      Notification.error({
        title: "数据库异常",
        content: (
          <Typography>
            <Text>初始化数据库失败,请在IndexedDB中删除DouBao-Downloader后刷新页面重试</Text>
            <br />
            <br />
            <Button theme="solid" onClick={() => {
              settingService.reStoreDatabase().then(() => {
                Toast.success("数据库已重置,3秒后自动刷新页面");
                setTimeout(() => {
                  window.location.reload();
                }, 3000);
              }).catch((err) => {
                Toast.error("数据库重置失败,请在控制台查看详细错误");
                console.error(`reStoreDatabase error: `, err);
              });
            }} type="danger">
              点击重置数据库(这可能会导致资源下载记录丢失)
            </Button>
          </Typography>
        ),
        duration: 0,
        position: "bottomRight",
      });
    })
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (matchesShortcut(event, panelShortcut)) {
        event.preventDefault();
        setIsOpenMainPanel((isOpen) => !isOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [panelShortcut]);

  const { download, progress, isDownloading } = useDownload();

  const updateSetting = useCallback((item: Setting) => {
    db.setting
      .update(item.id, {
        key: item.key,
        value: item.value,
      })
      .then((e) => {
        !e && Toast.error("设置失败");
      });
  }, []);

  const handleUpdateVideoDurationSuccess = useCallback(() => {
    Toast.success("已将视频生成时长修改为15秒");
  }, []);

  const handleUpdateVideoDurationError = useCallback((error: unknown) => {
    Toast.error("修改视频生成时长失败，请在控制台查看详细错误");
    console.error("updateVideoDuration error:", error);
  }, []);

  useJson({
    showRaw:
      setting.find((item: Setting) => item.key === "show_raw")?.value ?? false,
    enable15sVideo:
      setting.find((item: Setting) => item.key === "enable_15s_video")?.value ?? false,
    onUpdateVideoDurationSuccess: handleUpdateVideoDurationSuccess,
    onUpdateVideoDurationError: handleUpdateVideoDurationError,
    callback: (convMessages: ConvMessage[]) => {
      setConvMessageList((prev) => {
        const newConv = convMessages.filter(
          (message) =>
            !prev.some(
              (existing) =>
                existing.message_id === message.message_id &&
                existing.source === message.source,
            ),
        );
        if (newConv.length === 0) return prev;
        const newImageCount = newConv.filter(
          (message) =>
            message?.creation?.creation_type === "image"
        ).length;
        const newVideoCount = newConv.filter(
          (message) =>
            message?.creation?.creation_type === "video"
        ).length;
        if (newImageCount === 0 && newVideoCount === 0) return prev;
        const content = `捕获到: ${newImageCount > 0 ? '图片[' + newImageCount + ']张' : ''} ${newVideoCount > 0 ? '视频[' + newVideoCount + ']个' : ''}`;
        if (showCaptureNotificationRef.current) {
          Notification.info({
            title: "豆包下载器",
            content: (
              <>
                <div>
                  {
                    content
                  }
                  <Typography.Text link onClick={() => handleDownload(newConv)}>
                    点击此处一键下载
                  </Typography.Text>
                  。<br />
                  你也可以点击屏幕右侧豆包头像打开面板查看！
                </div>
              </>
            ),
            duration: 10,
            showClose: true,
            position: "bottomRight",
          });
        }
        return [...prev, ...newConv];
      });
    },
  });

  const changeFilter = useCallback(
    (key: keyof ConvFilter, value: string) => {
      setConvFilter((prev) => ({ ...prev, [key]: value }));
    },
    [convFilter],
  );

  const handleDownload = useCallback(
    async (convMessages: ConvMessage[]) => {
      if (isDownloading) {
        Toast.warning("正在下载中，请勿重复下载");
        return;
      }
      if (convMessages.length === 0) {
        Toast.warning("请选择要下载的内容");
        return;
      }
      const downloadedArray =
        setting.find((item) => item.key === 'skip_downloaded')?.value || false
          ? await db.downloaded.toArray()
          : [];
      const downloadedUrl = new Set(downloadedArray.map((item) => item.url));
      const customFilenameTemplate =
        setting.find((item) => item.key === "custom_filename_template")
          ?.value ||
        "${conversation_id}_${message_id}_${index_in_conv}_${creation.image.key}";
      const createFolder =
        setting.find((item) => item.key === "create_folder")?.value || false;
      const downloadByDisplayOrder =
        setting.find((item) => item.key === "download_by_display_order")?.value || false;

      const validConvs = convMessages.filter(
        (conv): conv is ConvMessage & { creation: Creation } =>
          conv.creation != null,
      );

      const displayOrderMap = new Map(
        validConvs.map((conv, index) => [conv.creation.image.key, index + 1]),
      );
      const withDisplayOrder = (
        filename: string,
        conv: ConvMessage & { creation: Creation },
      ) => {
        if (!downloadByDisplayOrder) return filename;
        const order = displayOrderMap.get(conv.creation.image.key);
        return order ? `${order}-${filename}` : filename;
      };

      const imageConvs = validConvs.filter(
        (conv) => conv.creation.creation_type === "image",
      );
      const videoConvs = validConvs.filter(
        (conv) => conv.creation.creation_type === "video",
      );

      // 解析视频真实下载地址
      const videoResults = await Promise.allSettled(
        videoConvs.map(async (conv) => {
          const videoUrl = await getSourceDownloadUrl(conv);
          return { conv, videoUrl };
        }),
      );

      // 构建图片下载列表。aispace 图片需要先通过 node_id 获取源文件地址。
      const imageResults = await Promise.allSettled(
        imageConvs.map(async (conv) => ({
          conv,
          imageUrl: await getSourceDownloadUrl(conv),
        })),
      );
      const imageDownloads = imageResults
        .filter(
          (result): result is PromiseFulfilledResult<{
            conv: ConvMessage & { creation: Creation };
            imageUrl: string;
          }> => result.status === "fulfilled",
        )
        .filter(({ value }) => !downloadedUrl.has(value.imageUrl))
        .map(({ value: { conv, imageUrl } }) => ({
          conversation_id: conv.conversation_id,
          message_id: conv.message_id,
          key: conv.creation.image.key.replace(/\//g, "_"),
          url: imageUrl,
          filename: withDisplayOrder(
            completeSuffix(
              replaceTemplate(customFilenameTemplate, conv),
              "png",
            ).replace(/\//g, "_"),
            conv,
          ),
          folder: createFolder ? conv.tts_content + "/" : "",
        }));

      // 构建视频下载列表
      const videoDownloads: typeof imageDownloads = [];
      videoResults.forEach((result) => {
        if (result.status === "fulfilled") {
          const { conv, videoUrl } = result.value;
          if (!downloadedUrl.has(videoUrl)) {
            videoDownloads.push({
              conversation_id: conv.conversation_id,
              message_id: conv.message_id,
              key: conv.creation.image.key.replace(/\//g, "_"),
              url: videoUrl,
              filename: withDisplayOrder(
                completeSuffix(
                  replaceTemplate(customFilenameTemplate, conv),
                  "mp4",
                ).replace(/\//g, "_"),
                conv,
              ),
              folder: createFolder ? conv.tts_content + "/" : "",
            });
          }
        }
      });

      // 统计获取失败的视频数量
      const failedVideoCount = videoResults.filter(
        (r) => r.status === "rejected",
      ).length;
      const failedImageCount = imageResults.filter(
        (r) => r.status === "rejected",
      ).length;
      if (failedVideoCount + failedImageCount > 0) {
        Toast.warning(`${failedVideoCount + failedImageCount} 个媒体获取下载地址失败，已跳过`);
      }

      const downloadImages = [...imageDownloads, ...videoDownloads];

      if (downloadImages.length === 0) {
        Toast.warning("没有可下载的内容");
        return;
      }
      // 视频缩略图URL，用于面板展示"已下载"标识
      const videoThumbnailUrls = videoResults
        .filter((r): r is PromiseFulfilledResult<{ conv: ConvMessage & { creation: Creation }; videoUrl: string }> => r.status === "fulfilled")
        .map((r) => r.value.conv.creation.image.image_ori_raw.url);

      download(downloadImages, {
        concurrency: setting.find(
          (item) => item.key === "download_concurrency",
        )?.value || 5,
        onSave() {
          Toast.success("下载完成");
          db.downloaded.bulkAdd([
            ...downloadImages.map((item) => ({ url: item.url })),
            ...videoThumbnailUrls.map((url) => ({ url })),
          ]);
        },
        onError(url, error) {
          Toast.error(`下载失败 ${url}: ${error.message}`);
        },
      });
    },
    [download, isDownloading, setting],
  );

  const handlePlay = useCallback(async (convMessage: ConvMessage) => {
    if (!convMessage.creation.vid) return;
    const playUrl = await getVideoUrl(convMessage.creation.vid)
    if (!playUrl) {
      Toast.error("获取视频播放地址失败");
      return;
    };
    window.open(playUrl, "_blank");
  }, [download, isDownloading, setting])

  const handleDelete = useCallback(async (convMessage: ConvMessage) => {
    const key = convMessage.creation?.image.key;
    if (!key) return;
    const existing = await db.deleted.where("key").equals(key).first();
    if (!existing) await db.deleted.add({ key });
    setSelectKeys((prev) => prev.filter((item) => item !== key));
    Toast.success("已从面板移除");
  }, []);

  const handleDownloadAll = useCallback(() => {
    const selectConv = convFilter.showConvId;
    const scopedConvs = convMessageList.filter((conv) => {
      if (!conv.creation || !matchesConvScope(conv, selectConv)) return false;
      if (convFilter.startTime && conv.create_time < convFilter.startTime) return false;
      if (convFilter.endTime && conv.create_time > convFilter.endTime) return false;
      return true;
    });
    const visibleConvs = filterDeletedConvs(scopedConvs, deletedKeys);
    const downloadConv = filterConvsByMediaType(visibleConvs, convFilter.mediaType);
    handleDownload(downloadConv);
  }, [convMessageList, convFilter, deletedKeys, handleDownload]);

  const handleDownloadSelected = useCallback(() => {
    handleDownload(
      selectKeys.map(
        (key) =>
          convMessageList.find((conv) => conv.creation?.image.key === key)!,
      ),
    );
  }, [convMessageList, handleDownload, selectKeys]);

  const handleSelect = useCallback(
    (key: string, checked: boolean) => {
      setSelectKeys((prev) => {
        return checked
          ? prev.includes(key)
            ? prev
            : [...prev, key]
          : prev.filter((item) => item !== key);
      });
    },
    [selectKeys],
  );

  return (
    <div
      id="doubao-downloader"
      className="dd:bg-background dd:text-foreground dd:h-0"
    >
      <Indicator hidden={hideIndicator} onClick={() => setIsOpenMainPanel(!isOpenMainPanel)} />
      <ProgressModal isDownloading={isDownloading} progress={progress} />
      <SettingContext.Provider
        value={{
          setting,
          updateSetting,
        }}
      >
        <SettingModal
          isOpenSetting={isOpenSetting}
          onCloseSetting={() => setIsOpenSetting(false)}
        />
      </SettingContext.Provider>
      <ConvContext.Provider
        value={{
          convMessage: convMessageList,
          selectKeys,
          handleSelect,
          handleDownload,
          handlePlay,
          handleDelete,
          handleDownloadAll,
          handleDownloadSelected,
        }}
      >
        <ConvFilterContext.Provider value={convFilter}>
          <MainPanel
            changeConvFilter={changeFilter}
            isOpenMainPanel={isOpenMainPanel}
            onCloseMainPanel={() => setIsOpenMainPanel(false)}
            isOpenSetting={isOpenSetting}
            openSetting={() => setIsOpenSetting(true)}
          />
        </ConvFilterContext.Provider>
      </ConvContext.Provider>
    </div>
  );
}

export default App;
