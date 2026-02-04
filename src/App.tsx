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
        e ? Toast.success("设置成功") : Toast.error("设置失败");
      });
  }, []);

  useJson({
    showRaw:
      setting.find((item: Setting) => item.key === "show_raw")?.value || true,
    callback: (convMessages: ConvMessage[]) => {
      const newConv = convMessages.filter(
        (message) =>
          !convMessageList.some(
            (prev) => prev.message_id === message.message_id,
          ),
      );
      newConv.length > 0 &&
        Notification.info({
          title: "豆包下载器",
          content: (
            <>
              <div>
                捕获到{newConv.length}张图片，
                <Typography.Text link onClick={() => handleDownload(newConv)}>
                  点击此处下载图片
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
    (convMessages: ConvMessage[]) => {
      if (isDownloading) {
        Toast.warning("正在下载中，请勿重复下载");
        return;
      }
      if (convMessages.length === 0) {
        Toast.warning("请选择要下载的图片");
        return;
      }
      const downloadImages = convMessages
        .filter(
          (conv): conv is ConvMessage & { creation: Creation } =>
            conv.creation != null,
        )
        .flatMap((conv) => {
          return {
            conversation_id: conv.conversation_id,
            message_id: conv.message_id,
            key: conv.creation.image.key,
            url: conv.creation.image.image_ori_raw.url,
          };
        });
      download(downloadImages, {
        onProgress(current, total) {
          if (total > 0 && current === total) {
            Toast.success("下载完成");
          }
        },
      });
    },
    [download, isDownloading],
  );

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
