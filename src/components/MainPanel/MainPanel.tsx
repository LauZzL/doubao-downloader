import { memo, useCallback, useContext, useMemo } from "react";
import { DragMove, Modal } from "@douyinfe/semi-ui-19";
import { useIsMobile } from "@/hooks/use-mobile";
import PanelHeader from "./PanelHeader";
import PanelFooter from "./PanelFooter";
import { ConvFilter, MediaType } from "@/types";
import ImageList from "./ImageList";
import { ConvContext } from "@/context/ConvContext";
import { ConvFilterContext } from "@/context/ConvFilterContext";
import { countConvsByMediaType } from "@/utils/media-filter";
import { filterDeletedConvs } from "@/utils/deleted-media";
import { useDeletedMediaKeys } from "@/hooks/use-deleted-media-keys";
import { matchesConvScope } from "@/utils/conv-filter";

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
  const { convMessage } = useContext(ConvContext);
  const convFilter = useContext(ConvFilterContext);
  const deletedKeys = useDeletedMediaKeys();
  const isMobile = useIsMobile();
  const width = isMobile ? MOBILE_WIDTH : DESKTOP_WIDTH;
  const height = isMobile ? MOBILE_HEIGHT : DESKTOP_HEIGHT;

  const handleCancel = () => {
    onCloseMainPanel();
  };

  const selectConv = useCallback((convId: string) => {
    changeConvFilter("showConvId", convId);
    changeConvFilter("currentPage", 1);
  }, []);

  const onChangePage = useCallback((page: number) => {
    changeConvFilter("currentPage", page);
  }, []);

  const changeTimeRange = useCallback((startTime?: number, endTime?: number) => {
    changeConvFilter("startTime", startTime);
    changeConvFilter("endTime", endTime);
    changeConvFilter("currentPage", 1);
  }, []);

  const changeMediaType = useCallback((mediaType: MediaType) => {
    changeConvFilter("mediaType", mediaType);
    changeConvFilter("currentPage", 1);
  }, []);

  const mediaCounts = useMemo(() => countConvsByMediaType(
    filterDeletedConvs(convMessage.filter((item) => {
      if (!item.creation?.image.image_ori_raw.url) return false;
      if (!matchesConvScope(item, convFilter.showConvId)) return false;
      if (convFilter.startTime && item.create_time < convFilter.startTime) return false;
      if (convFilter.endTime && item.create_time > convFilter.endTime) return false;
      return true;
    }), deletedKeys),
  ), [convMessage, convFilter, deletedKeys]);

  return (
    <Modal
      width={width}
      height={height}
      bodyStyle={{
        overflow: "auto",
        paddingBottom: "20px",
        cursor: "default",
      }}
      header={
        <PanelHeader
          changeConv={selectConv}
          changeMediaType={changeMediaType}
          changeTimeRange={changeTimeRange}
          mediaCounts={mediaCounts}
          mediaType={convFilter.mediaType}
          onCloseMainPanel={onCloseMainPanel}
          openSetting={openSetting}
        />
      }
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
