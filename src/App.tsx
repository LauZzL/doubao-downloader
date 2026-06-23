import { useCallback, useEffect, useState } from "react";
import { Indicator } from "./components/Indicator";
import MainPanel from "./components/MainPanel/MainPanel";
import { useJson } from "./hooks/use-json";
import { ConvFilter, ConvMessage, Creation, Setting } from "./types";
import { ConvContext } from "./context/ConvContext";
import { ConvFilterContext } from "./context/ConvFilterContext";
import { useDownload } from "./hooks/use-download";
import { Notification, Toast, Typography } from "@douyinfe/semi-ui-19";
import ProgressModal from "./components/ProgressModal";
import { db, SettingService } from "./db";
import SettingModal from "./components/SettingModal";
import { SettingContext } from "./context/SettingContext";
import { useLiveQuery } from "dexie-react-hooks";
import { completeSuffix, replaceTemplate } from "./utils/common";
import { getVideoUrl } from "@/api/video";

function App() {
  const [isOpenMainPanel, setIsOpenMainPanel] = useState(false);
  const [isOpenSetting, setIsOpenSetting] = useState(false);
  const [convMessageList, setConvMessageList] = useState<ConvMessage[]>([]);
  const [selectKeys, setSelectKeys] = useState<string[]>([]);
  const [convFilter, setConvFilter] = useState<ConvFilter>({
    showConvId: "-1",
    currentPage: 1,
    pageSize: 12,
  });

  useEffect(() => {
    Notification.config({
      position: "bottomRight",
    });
    const settingService = new SettingService();
    settingService.initDB();
  }, []);

  const { download, progress, isDownloading } = useDownload();

  const setting =
    useLiveQuery(() => db.setting.toArray(), []) || ([] as Setting[]);

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

  useJson({
    showRaw:
      setting.find((item: Setting) => item.key === "show_raw")?.value || false,
    callback: (convMessages: ConvMessage[]) => {
      const newConv = convMessages.filter(
        (message) =>
          !convMessageList.some(
            (prev) => prev.message_id === message.message_id,
          ),
      );
      const newImageCount = newConv.filter(
        (message) =>
          message?.creation?.creation_type === "image"
      ).length;
      const newVideoCount = newConv.filter(
        (message) =>
          message?.creation?.creation_type === "video"
      ).length;
      if (newImageCount <= 0 && newVideoCount <= 0) return;
      const content = `捕获到: ${newImageCount > 0 ? '图片[' + newImageCount + ']张' : ''} ${newVideoCount > 0 ? '视频[' + newVideoCount + ']个' : ''}`;
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
        position: "bottomRight",
      });
      setConvMessageList((prev) => [...prev, ...newConv]);
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

      const validConvs = convMessages.filter(
        (conv): conv is ConvMessage & { creation: Creation } =>
          conv.creation != null,
      );

      const imageConvs = validConvs.filter(
        (conv) => conv.creation.creation_type === "image",
      );
      const videoConvs = validConvs.filter(
        (conv) => conv.creation.creation_type === "video",
      );

      // 解析视频真实下载地址
      const videoResults = await Promise.allSettled(
        videoConvs.map(async (conv) => {
          const videoUrl = await getVideoUrl(conv.creation.vid!);
          return { conv, videoUrl };
        }),
      );

      // 构建图片下载列表
      const imageDownloads = imageConvs
        .filter(
          (conv) => !downloadedUrl.has(conv.creation.image.image_ori_raw.url),
        )
        .map((conv) => ({
          conversation_id: conv.conversation_id,
          message_id: conv.message_id,
          key: conv.creation.image.key.replace(/\//g, "_"),
          url: conv.creation.image.image_ori_raw.url,
          filename: completeSuffix(
            replaceTemplate(customFilenameTemplate, conv),
            "png",
          ).replace(/\//g, "_"),
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
              filename: completeSuffix(
                replaceTemplate(customFilenameTemplate, conv),
                "mp4",
              ).replace(/\//g, "_"),
              folder: createFolder ? conv.tts_content + "/" : "",
            });
          }
        }
      });

      // 统计获取失败的视频数量
      const failedVideoCount = videoResults.filter(
        (r) => r.status === "rejected",
      ).length;
      if (failedVideoCount > 0) {
        Toast.warning(`${failedVideoCount} 个视频获取下载地址失败，已跳过`);
      }

      const downloadImages = [...imageDownloads, ...videoDownloads];

      if (downloadImages.length === 0) {
        Toast.warning("没有可下载的内容");
        return;
      }
      download(downloadImages, {
        concurrency: setting.find(
          (item) => item.key === "download_concurrency",
        )?.value || 5,
        onSave() {
          Toast.success("下载完成");
          // 批量添加
          db.downloaded.bulkAdd(
            downloadImages.map((item) => ({
              url: item.url,
            })),
          );
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

  const handleDownloadAll = useCallback(() => {
    const selectConv = convFilter.showConvId;
    const downloadConv = convMessageList.filter(
      (conv) =>
        conv.creation &&
        (selectConv === "-1" || conv.conversation_id === selectConv),
    );
    handleDownload(downloadConv);
  }, [convMessageList, convFilter, handleDownload]);

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
      <Indicator onClick={() => setIsOpenMainPanel(!isOpenMainPanel)} />
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
