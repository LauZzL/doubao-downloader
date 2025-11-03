export type Creation = {
  image: {
    image_ori_raw: {
      url: string;
    };
    image_ori: {
      url: string;
    };
    image_preview: {
      url: string;
    };
    image_thumb: {
      url: string;
    };
  };
};


declare global {
  const __APP_VERSION__: string;
  const __BUILD_TIME__: string;
}
