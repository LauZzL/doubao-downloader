import { Card, Space, Button, Select } from "@douyinfe/semi-ui-19";
import { memo, useContext, useMemo } from "react";
import { ConvContext } from "@/context/ConvContext";

interface ActionCardProps {
  changeConv: (convId: string) => void;
}

function ActionCard({ changeConv }: ActionCardProps) {
  const { convMessage, handleDownloadAll, handleDownloadSelected } =
    useContext(ConvContext);
  const convMessageList = useMemo(
    () => convMessage.filter((item) => item.index_in_conv === 1),
    [convMessage],
  );
  const defaultSelected = "-1";

  return (
    <Card>
      <div className="dd:w-full dd:flex dd:items-center dd:justify-between dd:flex-row dd:cursor-default">
        <Select
          defaultValue={defaultSelected}
          style={{ width: 200 }}
          onChange={(value) => changeConv(value as string)}
        >
          <Select.Option key="-1" value="-1">
            所有对话
          </Select.Option>
          {convMessageList.map((item) => (
            <Select.Option
              key={item.conversation_id}
              value={item.conversation_id}
            >
              {item.tts_content}
            </Select.Option>
          ))}
        </Select>
        <Space>
          <Button onClick={handleDownloadSelected} type="tertiary">下载选中</Button>
          <Button onClick={handleDownloadAll} type="tertiary">全部下载</Button>
        </Space>
      </div>
    </Card>
  );
}

export default memo(ActionCard);
