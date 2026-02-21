export type SettingKey = "show_raw" | "skip_downloaded";
export type Setting = {
  id?: number;
  key: SettingKey;
  value: any;
  label?: string;
};

export type NewVersionData = {
  body: string;
  isNew: boolean;
};

export type Creation = {
  image: {
    image_ori_raw: {
      url: string;
    };
    key: string;
    gen_params: string;
  };
};

export type ConvMessage = {
  // 索引(1为该对话的第一条消息)
  index_in_conv: number;
  // 回复的消息ID
  bot_reply_message_id: string;
  // 文本内容
  tts_content: string;
  // 会话ID
  conversation_id: string;
  // 消息ID
  message_id: string;
  // 创建时间
  create_time: number;
  creation?: Creation;
};

export type DownloadImage = {
  conversation_id: string;
  message_id: string;
  key: string;
  url: string;
};

export type ConvFilter = {
  showConvId: string;
  currentPage: number;
  pageSize: number;
};

declare global {
  const __APP_VERSION__: string;
  const __BUILD_TIME__: string;
  interface Window {
    origin_parse: (data: string) => any;
    ZIP: any;
  }
}

interface FileLike {
  name: string;
  lastModified?: number;
  directory?: boolean;
  comment?: string;
  stream?: () => ReadableStream<Uint8Array>;
}

export type ZipWriter = {
  enqueue: (fileLike: FileLike) => void;
  close: () => void;
};
