import { memo, useCallback, useContext, useMemo } from "react";
import {
  Card,
  Image,
  Checkbox,
  Space,
  Button,
  Modal,
  Toast,
  Empty,
} from "@douyinfe/semi-ui-19";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConvMessage } from "@/types";
import { ConvContext } from "@/context/ConvContext";

interface ImageCardProps {
  className?: string;
  conv: ConvMessage;
}

function ImageCard({ className, conv }: ImageCardProps) {
  const wh = useIsMobile() ? 120 : 133;
  const { handleDownload, handleSelect, selectKeys } = useContext(ConvContext);

  const isSelected = useMemo(
    () => conv.creation && selectKeys.includes(conv.creation?.image.key),
    [conv, selectKeys],
  );

  const showPrompt = useCallback(() => {
    const gen_params = conv?.creation?.image.gen_params || "没有提示词";
    Modal.info({
      title: "提示词",
      content: gen_params,
      hasCancel: false,
      okText: "复制",
      onOk: () => {
        navigator.clipboard.writeText(gen_params);
        Toast.success("复制成功");
      },
    });
  }, [conv?.creation?.image.gen_params]);

  if (!conv.creation) {
    return (
      <div
        className={`${className} dd:relative dd:flex dd:items-center dd:justify-center`}
      >
        <Empty description="没有图像数据" />
      </div>
    );
  }

  return (
    <Card
      className={`${className} dd:relative dd:flex dd:items-center dd:justify-center`}
    >
      <Image
        width={wh}
        height={wh}
        src={conv.creation.image.image_ori_raw.url}
      />
      <Checkbox
        onChange={(e) =>
          conv.creation?.image.key &&
          handleSelect(conv.creation?.image.key, e.target.checked || false)
        }
        checked={isSelected}
        className="dd:absolute! dd:top-1 dd:right-1"
      />
      <Space className="dd:mt-2!">
        <Button type="tertiary" onClick={showPrompt}>
          提示词
        </Button>
        <Button onClick={() => handleDownload([conv])} type="tertiary">
          下载
        </Button>
      </Space>
    </Card>
  );
}

export default memo(ImageCard);
