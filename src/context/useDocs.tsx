import { useSupportedFeatures } from "./useSupportedFeatures";

export const useDocs = (): string => {
  const remoteBase = "https://linuxcontainers.cn/incus/docs/main";
  const localBase = "https://linuxcontainers.cn/incus/docs/main";

  const { hasLocalDocumentation } = useSupportedFeatures();

  if (!hasLocalDocumentation) {
    return remoteBase;
  }

  return localBase;
};
