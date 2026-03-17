// ${} 语法
// 支持data多层
export const replaceTemplate = (template: string, data: any) => {
  return template.replace(/\${([\w.]+)}/g, (_, key) => {
    let value = data;
    key.split(".").forEach((k: string) => {
      value = value[k];
    });
    return value;
  });
};

export const completeSuffix = (filename: string, suffix: string) => {
  if (!filename.endsWith(suffix)) {
    return `${filename}.${suffix}`;
  }
  return filename;
};
