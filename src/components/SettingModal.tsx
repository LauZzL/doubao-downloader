import { Modal, Switch, Toast } from "@douyinfe/semi-ui-19";
import { useContext } from "react";
import { SettingContext } from "@/context/SettingContext";
import { Setting } from "@/types";

interface SettingModalProps {
  isOpenSetting: boolean;
  onCloseSetting: () => void;
}

function SettingModal({ isOpenSetting, onCloseSetting }: SettingModalProps) {
  const { setting, updateSetting } = useContext(SettingContext);
  const showRaw = setting.find((item) => item.key === "show_raw");
  const skipDownloaded = setting.find((item) => item.key === "skip_downloaded");

  const changeSetting = (item: Setting | undefined, value: any) => {
    if (!item) {
      Toast.error("无法获取到设置项");
      return;
    }
    updateSetting({
      ...item,
      value,
    });
  };

  return (
    <Modal
      title="设置"
      visible={isOpenSetting}
      onCancel={onCloseSetting}
      footer={null}
      getPopupContainer={() =>
        document.getElementById("dd-modal-popup-container") || document.body
      }
    >
      <div className="dd:flex dd:flex-col dd:items-start dd:gap-2 dd:pb-5!">
        <div className="dd:flex dd:flex-row dd:items-center dd:gap-2">
          <Switch
            checked={showRaw?.value}
            onChange={(checked) => {
              changeSetting(showRaw, checked);
            }}
          />
          <label className="dd:text-sm">{showRaw?.label}</label>
        </div>
        <div className="dd:flex dd:flex-row dd:items-center dd:gap-2">
          <Switch
            checked={skipDownloaded?.value}
            onChange={(checked) => {
              changeSetting(skipDownloaded, checked);
            }}
          />
          <label className="dd:text-sm">{skipDownloaded?.label}</label>
        </div>
        {/* 
          TODO 自定义下载文件名 string
          使用${}占位，支持Conv数据填充
          ${index}-${tts_content}-${message_id}
          1-生成小猫图片-XXXXXXXXXXXXX.png
        */}

        {/* 
          TODO 下载时为每个会话创建文件夹 true|false
          默认为false
          当为true时，以conversation_id为文件夹分类，文件夹名称为index_in_conv===1的tts_content
          zipWriter.enqueue( {directory: true} )
        */}

        {/* 
          TODO 下载并发数 number
          默认为 5
        */}
      </div>
    </Modal>
  );
}

export default SettingModal;
