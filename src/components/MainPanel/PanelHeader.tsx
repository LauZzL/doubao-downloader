import { Space, Button } from "@douyinfe/semi-ui-19";
import { IconGithubLogo, IconClose, IconSetting } from "@douyinfe/semi-icons";
import { useIsMobile } from "@/hooks/use-mobile";
import ActionCard from "./ActionCard";

interface PanelHeaderProps {
  onCloseMainPanel: () => void;
  changeConv: (convId: string) => void;
  openSetting: () => void;
}

function PanelHeader({ onCloseMainPanel, changeConv, openSetting }: PanelHeaderProps) {
  const isMobile = useIsMobile();


  return (
    <div>
      <div className="dd:h-15 dd:w-full dd:flex dd:flex-row dd:items-center dd:justify-between">
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800 }}>豆包下载器</h3>
        </div>
        <div>
          <Space>
            <Button
              theme="outline"
              type="tertiary"
              size="small"
              icon={<IconGithubLogo />}
              onClick={() =>
                window.open("https://github.com/lauzzl/doubao-downloader")
              }
            >
              {isMobile ? "" : "Source Code"}
            </Button>
            <Button
              theme="outline"
              type="tertiary"
              size="small"
              icon={<IconSetting />}
              onClick={() => openSetting()}
            ></Button>
            <Button
              theme="outline"
              type="tertiary"
              size="small"
              icon={<IconClose />}
              onClick={onCloseMainPanel}
            ></Button>
          </Space>
        </div>
      </div>
      <ActionCard changeConv={changeConv} />
    </div>
  );
}

export default PanelHeader;
