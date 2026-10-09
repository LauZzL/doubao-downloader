const GET_VIDEO_INFO_URL = `/samantha/aispace/get_download_info?aid=497858&device_platform=web&samantha_web=1&use-olympus-account=1&version_code=20800&pkg_type=release_version`;
const GET_NODE_INFO = `/samantha/aispace/node_info?aid=497858&device_platform=web&samantha_web=1&use-olympus-account=1&version_code=20800&pkg_type=release_version`;
const HOME_PAGE = `/samantha/aispace/homepage?aid=497858&device_platform=web&samantha_web=1&use-olympus-account=1&version_code=20800&pkg_type=release_version`;

async function post(url: string, body: any = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`请求失败：${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (data?.code !== undefined && data.code !== 0) {
    throw new Error(data?.message || "接口请求失败");
  }

  return data;
}

async function getHomePage() {
  const jsonData = await post(HOME_PAGE);
  const id = jsonData.data?.children?.find(
    (e: any) => e.name === "我的创作",
  )?.id;

  if (id) return id;
  throw new Error("获取创作ID失败");
}

async function getNodeId(creationId: string | number, vid: string | number) {
  const data = await post(GET_NODE_INFO, {
    node_id: creationId,
    need_full_path: true,
    size: 50,
    sort_param: {
      need_sort_config: true,
      sort_order: 1,
      sort_type: 0,
    },
  });

  const id = data.data?.children?.find(
    (e: any) => String(e.key) === String(vid),
  )?.id;

  if (id) return id;
  throw new Error("获取nodeId失败");
}

/**
 * 通过vid获取视频真实播放地址
 * @param vid 唯一标识
 * @returns main_url 视频地址
 */
export async function getVideoUrl(vid: string | number) {
  const creationId = await getHomePage();
  const node_id = await getNodeId(creationId, vid);

  return getVideoUrlByNodeId(node_id);
}

/** Resolve an existing creation node without needing its conversation or vid. */
export async function getVideoUrlByNodeId(nodeId: string | number) {
  const node_id = typeof nodeId === "string" ? nodeId.trim() : nodeId;
  if (!node_id) throw new Error("请输入作品 nodeId");

  const data = await post(GET_VIDEO_INFO_URL, {
    requests: [{ node_id }],
  });

  const mainUrl = data.data?.download_infos?.[0]?.main_url;

  if (mainUrl) return mainUrl;
  throw new Error("获取播放地址失败");
}
