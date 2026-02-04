import { Modal, Switch } from "@douyinfe/semi-ui-19";
import { useContext} from "react";
import { SettingContext } from "@/context/SettingContext";

interface SettingModalProps {
  isOpenSetting: boolean;
  onCloseSetting: () => void;
}

function SettingModal({ isOpenSetting, onCloseSetting }: SettingModalProps) {
  const { setting, updateSetting } = useContext(SettingContext);

  const showRaw = setting.find((item) => item.key === "show_raw");

  return (
    <Modal
      title="设置"
      visible={isOpenSetting}
      onCancel={onCloseSetting}
      footer={null}
      getPopupContainer={() =>
        document.getElementById("dd-modal-popup-container") ||
        document.body
      }
    >
      <div className="dd:flex dd:items-start dd:gap-2 dd:pb-5!">
        <div className="dd:flex dd:flex-row dd:items-center dd:gap-2">
          <Switch
            checked={showRaw?.value}
            onChange={(checked) => {
              updateSetting({ id: showRaw?.id, key: "show_raw", value: checked });
            }}
          />
          <label className="dd:text-sm">会话列表图片无水印展示</label>
        </div>
      </div>
    </Modal>
  );
}

export default SettingModal;
