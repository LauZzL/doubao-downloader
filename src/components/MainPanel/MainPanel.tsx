import { memo, useCallback } from "react";
import { DragMove, Modal } from "@douyinfe/semi-ui-19";
import { useIsMobile } from "@/hooks/use-mobile";
import PanelHeader from "./PanelHeader";
import PanelFooter from "./PanelFooter";
import { ConvFilter } from "@/types";
import ImageList from "./ImageList";

const DESKTOP_WIDTH = "50rem";
const DESKTOP_HEIGHT = "37.5rem";
const MOBILE_WIDTH = "80vw";
const MOBILE_HEIGHT = "70vh";

interface MainPanelProps {
  isOpenMainPanel: boolean;
  isOpenSetting: boolean;
  onCloseMainPanel: () => void;
  openSetting: () => void;
  changeConvFilter: (key: keyof ConvFilter, value: any) => void;
}

function MainPanel(props: MainPanelProps) {
  const { isOpenMainPanel, onCloseMainPanel, changeConvFilter, openSetting } = props;
  const isMobile = useIsMobile();
  const width = isMobile ? MOBILE_WIDTH : DESKTOP_WIDTH;
  const height = isMobile ? MOBILE_HEIGHT : DESKTOP_HEIGHT;

  const handleCancel = () => {
    onCloseMainPanel();
  };

  const selectConv = useCallback((convId: string) => {
    changeConvFilter("showConvId", convId);
  }, []);

  const onChangePage = useCallback((page: number) => {
    changeConvFilter("currentPage", page);
  }, []);

  return (
    <Modal
      width={width}
      height={height}
      bodyStyle={{
        overflow: "auto",
        paddingBottom: "20px",
        cursor: "default",
      }}
      header={<PanelHeader openSetting={openSetting} changeConv={selectConv} onCloseMainPanel={onCloseMainPanel} />}
      visible={isOpenMainPanel}
      onCancel={handleCancel}
      closeOnEsc={true}
      keepDOM={true}
      maskClosable={false}
      hasCancel={false}
      footer={<PanelFooter changePage={onChangePage} />}
      modalRender={(modal) => <DragMove>{modal}</DragMove>}
    >
      <ImageList className="dd:mt-5!"/>
    </Modal>
  );
}

export default memo(MainPanel);
