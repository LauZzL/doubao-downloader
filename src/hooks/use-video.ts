import { useState, useCallback } from "react";
import { getVideoUrl } from "@/api/video";

export function useVideo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [playUrl, setPlayUrl] = useState("");

  const fetchPlayUrlByVid = useCallback(async (vid: string | number) => {
    try {
      setLoading(true);
      setError(null);
      const url = await getVideoUrl(vid);
      setPlayUrl(url);
      return url;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    playUrl,
    fetchPlayUrlByVid,
  };
}