import { useContext, useMemo } from "react";
import { ConvContext } from "@/context/ConvContext";
import { ConvFilterContext } from "@/context/ConvFilterContext";
import { filterConvsByMediaType } from "@/utils/media-filter";
import { filterDeletedConvs } from "@/utils/deleted-media";
import { useDeletedMediaKeys } from "@/hooks/use-deleted-media-keys";
import { matchesConvScope } from "@/utils/conv-filter";

/**
 * 获取conv列表
 * @returns conv
 */
export function useConvs() {
  const convMessages = useContext(ConvContext);
  const convFilter = useContext(ConvFilterContext);
  const deletedKeys = useDeletedMediaKeys();
  
  return useMemo(() => {
    const convMessageList = convMessages.convMessage.filter(
      (item) => item.creation && matchesConvScope(item, convFilter.showConvId),
    );

    const convs = convMessageList
      .filter((item) => item.creation?.image.image_ori_raw.url)
      .filter((item) => {
        if (convFilter.startTime && item.create_time < convFilter.startTime) return false;
        if (convFilter.endTime && item.create_time > convFilter.endTime) return false;
        return true;
      });

    const visibleConvs = filterDeletedConvs(convs, deletedKeys);
    const filteredConvs = filterConvsByMediaType(visibleConvs, convFilter.mediaType);

    const startIndex = (convFilter.currentPage - 1) * convFilter.pageSize;
    const endIndex = startIndex + convFilter.pageSize;

    return filteredConvs.slice(startIndex, endIndex);
  }, [convMessages, convFilter, deletedKeys]);
}
