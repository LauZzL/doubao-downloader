import { NewVersionData } from "@/types";
import { useEffect, useState } from "react";

const getLatestRelease = async () => {
  const response = await fetch(
    "https://api.github.com/repos/lauzzl/doubao-downloader/releases/latest",
  );
  const data = await response.json();
  return data;
};

const isNewVersion = (currentVersion: string, latestVersion: string) => {
  const currentVersionParts = currentVersion.split(".");
  const latestVersionParts = latestVersion.split(".");

  for (
    let i = 0;
    i < Math.max(currentVersionParts.length, latestVersionParts.length);
    i++
  ) {
    const currentPart = parseInt(currentVersionParts[i] || "0");
    const latestPart = parseInt(latestVersionParts[i] || "0");
    if (currentPart < latestPart) {
      return true;
    } else if (currentPart > latestPart) {
      return false;
    }
  }
};

export const useCheckVersion = () => {
  const [newVersion, setNewVersion] = useState<NewVersionData>();

  useEffect(() => {
    getLatestRelease()
      .then((data) => {
        const latestVersion = data.tag_name.replace("v", "");
        const isNewVer = isNewVersion(__APP_VERSION__, latestVersion) || false;
        setNewVersion({
          body: data.body,
          isNew: isNewVer,
        });
      })
      .catch((error) => {
        console.error("failed to get latest release", error);
      });
  }, []);

  return { ...newVersion };
};
