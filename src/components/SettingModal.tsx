import { Modal, Switch, Toast, InputNumber, Input } from "@douyinfe/semi-ui-19";
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
  const downloadConcurrency = setting.find(
    (item) => item.key === "download_concurrency",
  );
  const customFilenameTemplate = setting.find(
    (item) => item.key === "custom_filename_template",
  );
  const createFolder = setting.find((item) => item.key === "create_folder");

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
          <label className="dd:text-sm">{showRaw?.label}</label>
          <Switch
            checked={showRaw?.value}
            onChange={(checked) => {
              changeSetting(showRaw, checked);
            }}
          />
        </div>
        <div className="dd:flex dd:flex-row dd:items-center dd:gap-2">
          <label className="dd:text-sm">{skipDownloaded?.label}</label>
          <Switch
            checked={skipDownloaded?.value}
            onChange={(checked) => {
              changeSetting(skipDownloaded, checked);
            }}
          />
        </div>

        <div className="dd:flex dd:flex-row dd:items-center dd:gap-2">
          <label className="dd:text-sm">{customFilenameTemplate?.label}</label>
          <Input
            placeholder="请输入自定义文件名模板，为空则使用默认模板"
            value={customFilenameTemplate?.value}
            onEnterPress={(e) => {
              changeSetting(customFilenameTemplate, e.currentTarget.value);
            }}
          />
        </div>

        <div className="dd:flex dd:flex-row dd:items-center dd:gap-2">
          <label className="dd:text-sm">{createFolder?.label}</label>
          <Switch
            checked={createFolder?.value}
            onChange={(checked) => {
              changeSetting(createFolder, checked);
            }}
          />
        </div>

        <div className="dd:flex dd:flex-row dd:items-center dd:gap-2">
          <label className="dd:text-sm">{downloadConcurrency?.label}</label>
          <InputNumber
            min={0}
            max={Number.MAX_SAFE_INTEGER}
            value={downloadConcurrency?.value}
            onEnterPress={(e) => {
              changeSetting(downloadConcurrency, e.currentTarget.value);
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

export default SettingModal;
