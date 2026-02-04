import { Setting } from "@/types";
import { createContext } from "react";

export interface SettingContextProps {
  setting: Setting[];
  updateSetting: (item: Setting) => void;
}

export const SettingContext = createContext<SettingContextProps>({
  setting: [],
  updateSetting: () => {},
});
