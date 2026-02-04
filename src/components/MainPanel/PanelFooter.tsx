import { Pagination } from "@douyinfe/semi-ui-19";
import { useCreationPagination } from "@/hooks/use-creation-pagination";

interface PanelFooterProps {
  changePage: (page: number) => void;
}

function PanelFooter({ changePage }: PanelFooterProps) {
  const creationPagination = useCreationPagination();
  
  return (
    <div className="dd:flex dd:justify-center dd:items-center ">
      <Pagination
        onPageChange={changePage}
        showTotal
        showQuickJumper
        hideOnSinglePage
        className="dd:self-center"
        total={creationPagination.totalItems}
        pageSize={creationPagination.pageSize}
        currentPage={creationPagination.currentPage}
      ></Pagination>
    </div>
  );
}

export default PanelFooter;
