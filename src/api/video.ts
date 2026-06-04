const GET_VIDEO_INFO_URL = `/samantha/media/get_play_info?version_code=20800&language=zh&device_platform=web&aid=497858&real_aid=497858&pkg_type=release_version&device_id=7622868208475047462&pc_version=3.20.2&web_id=&tea_uuid=&region=CN&sys_region=CN&samantha_web=1&web_platform=browser&use-olympus-account=1&web_tab_id=`;

/**
 * 通过vid获取视频真实播放地址
 * @param vid 唯一标识
 * @returns main_url 视频地址
 */
export async function getVideoUrl(vid: string | number) {
  const res = await fetch(GET_VIDEO_INFO_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key: vid }),
  });
  const data = await res.json();
  if (data?.code === 0 && data.data?.original_media_info?.main_url) {
    return data.data.original_media_info.main_url;
  }
  throw new Error("获取播放地址失败");
}