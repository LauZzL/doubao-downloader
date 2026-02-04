import { Modal, Progress } from "@douyinfe/semi-ui-19";

interface ProgressModalProps {
  isDownloading: boolean;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
}

function ProgressModal({ isDownloading, progress }: ProgressModalProps) {
  const strokeArr = [
    { percent: 0, color: "rgb(249, 57, 32)" },
    { percent: 50, color: "#46259E" },
    { percent: 100, color: "hsla(125, 50%, 46% / 1)" },
  ];

  return (
    isDownloading && (
      <Modal
        title="正在下载"
        visible={isDownloading}
        closable={false}
        closeOnEsc={false}
        footer={null}
        maskClosable={false}
        getPopupContainer={() =>
          document.getElementById("dd-modal-popup-container") || document.body
        }
        bodyStyle={{
            padding: '10px',
            paddingBottom: '30px'
        }}
      >
        <Progress percent={progress.percentage} showInfo stroke={strokeArr}></Progress>
      </Modal>
    )
  );
}

export default ProgressModal;
