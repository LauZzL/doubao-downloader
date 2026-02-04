import ImageCard from "./ImageCard";
import { useConvs } from "@/hooks/use-convs";
import { Empty } from "@douyinfe/semi-ui-19";
import { useMemo } from "react";

interface ImageListProps {
  className?: string;
}

function ImageList({ className }: ImageListProps) {
  const convs = useConvs();

  const BodyContent = useMemo(() => {
    if (convs.length > 0) {
      return (
        <div
          className={`${className} dd:grid dd:grid-cols-2 dd:sm:grid-cols-3 dd:lg:grid-cols-4 dd:gap-2`}
        >
          {convs.map((conv, index) => (
            <ImageCard className="dd:mt-2!" key={index} conv={conv} />
          ))}
        </div>
      );
    }
    return (
      <div className="dd:flex dd:justify-center dd:items-center dd:h-full">
        <Empty description="暂无数据" />
      </div>
    );
  }, [convs]);

  return (
    <div id="dd-modal-popup-container" className="dd:w-full dd:h-full">
      {BodyContent}
    </div>
  );
}

export default ImageList;
