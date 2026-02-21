import { Modal, Switch } from "@douyinfe/semi-ui-19";
import { useContext } from "react";
import { SettingContext } from "@/context/SettingContext";

interface SettingModalProps {
  isOpenSetting: boolean;
  onCloseSetting: () => void;
}

function SettingModal({ isOpenSetting, onCloseSetting }: SettingModalProps) {
  const { setting, updateSetting } = useContext(SettingContext);

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
        {setting.map((item) => (
          <div
            key={item.key}
            className="dd:flex dd:flex-row dd:items-center dd:gap-2"
          >
            <Switch
              checked={item.value}
              onChange={(checked) => {
                updateSetting({ id: item.id, key: item.key, value: checked });
              }}
            />
            <label className="dd:text-sm">{item.label}</label>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export default SettingModal;
