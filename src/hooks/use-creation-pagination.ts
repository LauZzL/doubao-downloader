import { useContext, useMemo } from "react";
import { ConvContext } from "@/context/ConvContext";
import { ConvFilterContext } from "@/context/ConvFilterContext";

export function useCreationPagination() {
  const convMessages = useContext(ConvContext);
  const convFilter = useContext(ConvFilterContext);
  
  return useMemo(() => {
    const convMessageList = convMessages.convMessage.filter(
      (item) => item.creation && ((item.conversation_id === convFilter.showConvId) || convFilter.showConvId === '-1'),
    );

    const convs = convMessageList.filter((item) => item.creation?.image.image_ori_raw.url);

    const totalItems = convs.length;
    const pageSize = convFilter.pageSize || 12;
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      totalItems,
      totalPages,
      currentPage: convFilter?.currentPage || 1,
      pageSize,
    };
  }, [convMessages, convFilter]);
}