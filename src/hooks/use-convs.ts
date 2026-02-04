import { useContext, useMemo } from "react";
import { ConvContext } from "@/context/ConvContext";
import { ConvFilterContext } from "@/context/ConvFilterContext";

/**
 * 获取conv列表
 * @returns conv
 */
export function useConvs() {
  const convMessages = useContext(ConvContext);
  const convFilter = useContext(ConvFilterContext);
  
  return useMemo(() => {
    const convMessageList = convMessages.convMessage.filter(
      (item) => item.creation && ((item.conversation_id === convFilter.showConvId) || convFilter.showConvId === '-1'),
    );

    const convs = convMessageList.filter((item) => item.creation?.image.image_ori_raw.url);

    const startIndex = (convFilter.currentPage - 1) * convFilter.pageSize;
    const endIndex = startIndex + convFilter.pageSize;
    
    return convs.slice(startIndex, endIndex);
  }, [convMessages, convFilter]);
}