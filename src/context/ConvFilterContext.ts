import { createContext } from "react";
import type { ConvFilter } from "@/types";

export const ConvFilterContext = createContext<ConvFilter>({
    showConvId: "-1",
    currentPage: 1,
    pageSize: 12,
    // TODO 根据create_time筛选
});