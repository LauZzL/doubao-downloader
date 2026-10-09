import { useRef, useState } from "react";
import { Button, Input, Modal, Toast } from "@douyinfe/semi-ui-19";
import { getVideoUrlByNodeId } from "@/api/video";
import { useDownload } from "@/hooks/use-download";

export default function VideoRecovery() {
  const [visible, setVisible] = useState(false);
  const [nodeId, setNodeId] = useState("");
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const { download } = useDownload();

  const recover = async () => {
    const id = nodeId.trim();
    if (!id || busy.current) return;
    busy.current = true;
    setLoading(true);
    try {
      const url = await getVideoUrlByNodeId(id);
      await download([{
        conversation_id: "", message_id: "", key: id, url,
        filename: "recovered-video.mp4",
      }], {
        onError: (_url, error) => Toast.error(error.message),
        onSave: () => {
          Toast.success("已开始保存视频");
          setVisible(false);
        },
      });
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : "获取视频下载地址失败");
    } finally {
      busy.current = false;
      setLoading(false);
    }
  };

  return <>
    <Button type="tertiary" onClick={() => setVisible(true)}>按作品ID下载视频</Button>
    <Modal
      title="按作品ID下载视频"
      visible={visible}
      onCancel={() => { if (!busy.current) setVisible(false); }}
      onOk={recover}
      okText="下载视频"
      confirmLoading={loading}
      okButtonProps={{ disabled: !nodeId.trim() }}
      cancelButtonProps={{ disabled: loading }}
      maskClosable={!loading}
      closeOnEsc={!loading}
    >
      <p>对话已删除，但视频仍在「AI创作」中时，可尝试使用作品 nodeId 下载。请先登录该作品所属的豆包账号。获取方法见 README 常见问题。</p>
      <Input aria-label="作品 nodeId" value={nodeId} onChange={setNodeId} disabled={loading} />
    </Modal>
  </>;
}
