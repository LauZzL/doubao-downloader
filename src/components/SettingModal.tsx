import { Modal, Switch, Toast, InputNumber, Input } from "@douyinfe/semi-ui-19";
import { useCallback, useContext } from "react";
import { SettingContext } from "@/context/SettingContext";
import { Setting, SettingKey } from "@/types";
import { SETTING_DEFAULTS } from "@/db";
import useSetting from "@/hooks/use-setting";

interface SettingModalProps {
  isOpenSetting: boolean;
  onCloseSetting: () => void;
}

function SettingModal({ isOpenSetting, onCloseSetting }: SettingModalProps) {
  const { setting, updateSetting } = useContext(SettingContext);

  const getSetting = (key: SettingKey): Setting => {
    const found = setting.find(item => item.key === key);
    if (found) return found;
    const defaultItem = SETTING_DEFAULTS.find(item => item.key === key);
    if (defaultItem) return defaultItem as Setting;
    return { key, label: key, value: null } as Setting;
  };

  const changeSetting = useCallback((item: Setting, value: any) => {
    if (!item) {
      Toast.error("无法获取到设置项");
      return;
    }
    updateSetting({ ...item, value });
  }, [updateSetting]);


  const showRaw = getSetting("show_raw");
  const skipDownloaded = getSetting("skip_downloaded");
  const downloadConcurrency = getSetting("download_concurrency");
  const customFilenameTemplate = getSetting("custom_filename_template");
  const createFolder = getSetting("create_folder");

  const customFilenameTemplateLocal = useSetting(customFilenameTemplate, changeSetting);
  const downloadConcurrencyLocal = useSetting(downloadConcurrency, changeSetting);


  const handleClose = () => {
    customFilenameTemplateLocal.flush();
    downloadConcurrencyLocal.flush();
    onCloseSetting();
  };


  return (
    <Modal
      title="设置"
      visible={isOpenSetting}
      onCancel={handleClose}
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
          <label className="dd:text-sm">{createFolder?.label}</label>
          <Switch
            checked={createFolder?.value}
            onChange={(checked) => {
              changeSetting(createFolder, checked);
            }}
          />
        </div>

        <div className="dd:flex dd:flex-row dd:items-center dd:gap-2">
          <label className="dd:text-sm">{customFilenameTemplate?.label}</label>
          <Input
            placeholder="请输入自定义文件名模板，为空则使用默认模板"
            value={customFilenameTemplateLocal.value}
            onChange={customFilenameTemplateLocal.onChange}
          />
        </div>

        <div className="dd:flex dd:flex-row dd:items-center dd:gap-2">
          <label className="dd:text-sm">{downloadConcurrency?.label}</label>
          <InputNumber
            min={0}
            max={Number.MAX_SAFE_INTEGER}
            value={downloadConcurrencyLocal.value as number}
            onChange={downloadConcurrencyLocal.onChange}
          />
        </div>
      </div>
    </Modal>
  );
}

export default SettingModal;
