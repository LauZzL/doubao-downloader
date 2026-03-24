import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import { Setting } from "@/types";

export default function useSetting<T>(
  setting: Setting | undefined,
  updateSetting: (item: Setting, value: T) => void,
  delay: number = 500,
) {
  const [localValue, setLocalValue] = useState<T>(setting?.value);

  useEffect(() => {
    if (setting) {
      setLocalValue(setting.value as T);
    }
  }, [setting]);

  const debouncedUpdate = useCallback(
    debounce((value: T) => {
      if (setting) {
        updateSetting(setting, value);
      }
    }, delay),
    [setting, updateSetting, delay],
  );

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  const flush = useCallback(() => {
    debouncedUpdate.flush();
  }, [debouncedUpdate]);

  const handleChange = useCallback(
    (value: T) => {
      setLocalValue(value);
      debouncedUpdate(value);
    },
    [debouncedUpdate],
  );

  return {
    value: localValue,
    onChange: handleChange,
    flush,
  };
}
