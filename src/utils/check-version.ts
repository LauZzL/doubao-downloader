import { toast } from "sonner";

const LATEST_RELEASE_URL = "https://api.github.com/repos/lauzzl/doubao-downloader/releases/latest";

export async function checkVersion() { 
    const response = await fetch(LATEST_RELEASE_URL);
    if (!response.ok) {
        toast.error("获取最新版本失败");
        return;
    }
    const data = await response.json();
    const latestVersion = data.tag_name?.replace(/^v/, "");
    if(isNewVersion(__APP_VERSION__, latestVersion)) {
        toast.info("🎉 新版本已发布", {
            description: `当前版本: ${__APP_VERSION__}\n最新版本: ${latestVersion}\n请前往Github下载新版本`,
            action: {
                label: "前往Github",
                onClick: () => {
                    window.open("https://github.com/lauzzl/doubao-downloader/releases/latest");
                },
            }
        })
    }
}

const isNewVersion = (currentVersion: string, latestVersion: string) => {

  const currentVersionParts = currentVersion.split(".");
  const latestVersionParts = latestVersion.split(".");

  for (let i = 0; i < Math.max(currentVersionParts.length, latestVersionParts.length); i++) {
    const currentPart = parseInt(currentVersionParts[i] || "0");
    const latestPart = parseInt(latestVersionParts[i] || "0");
    if (currentPart < latestPart) {
      return true;
    } else if (currentPart > latestPart) {
      return false;
    }
  }
}