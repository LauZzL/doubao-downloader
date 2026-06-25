import { Card, Space, Button, Select, DatePicker } from "@douyinfe/semi-ui-19";
import { memo, useCallback, useContext, useMemo } from "react";
import { ConvContext } from "@/context/ConvContext";

interface ActionCardProps {
  changeConv: (convId: string) => void;
  changeTimeRange: (startTime?: number, endTime?: number) => void;
}

function ActionCard({ changeConv, changeTimeRange }: ActionCardProps) {
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
          <Select.Option className="dd:justify-start!" key="-1" value="-1">
            所有对话
          </Select.Option>
          {convMessageList.map((item) => (
            <Select.Option
              className="dd:justify-start!"
              key={item.conversation_id}
              value={item.conversation_id}
            >
              {item.tts_content}
            </Select.Option>
          ))}
        </Select>
        <DatePicker
          type="dateRange"
          placeholder={["开始日期", "结束日期"]}
          onChange={(date) => {
            if (date && Array.isArray(date) && date.length === 2) {
              const [start, end] = date as [Date, Date];
              changeTimeRange(start.getTime(), end.getTime() + 86400000 - 1);
            } else {
              changeTimeRange(undefined, undefined);
            }
          }}
          style={{ width: 240 }}
        />
        <Space>
          <Button onClick={handleDownloadSelected} type="tertiary">下载选中</Button>
          <Button onClick={handleDownloadAll} type="tertiary">全部下载</Button>
        </Space>
      </div>
    </Card>
  );
}

export default memo(ActionCard);
