import { ConvMessage } from "@/types";
import { createContext } from "react";

export interface ConvContextProps {
  selectKeys: string[]
  convMessage: ConvMessage[]
  handleSelect: (key: string, checked: boolean) => void
  handleDownload: (convMessages: ConvMessage[]) => void
  handleDownloadAll: () => void
  handleDownloadSelected: () => void
}

export const ConvContext = createContext<ConvContextProps>({
    selectKeys: [],
    convMessage: [],
    handleSelect: () => {},
    handleDownload: () => {},
    handleDownloadAll: () => {},
    handleDownloadSelected: () => {}
});