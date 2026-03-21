import type { FC } from "react";
import { useState } from "react";
import type { LxdImage } from "types/image";
import {
  ActionButton,
  Icon,
  useToastNotification,
} from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";

interface Props {
  image: LxdImage;
  project: string;
}

const DownloadImageBtn: FC<Props> = ({ image, project }) => {
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const description = image.properties?.description ?? image.fingerprint;
  const isUnifiedTarball = image.update_source == null; //Only Split Tarballs have an update_source.
  const url = `/1.0/images/${encodeURIComponent(image.fingerprint)}/export?project=${encodeURIComponent(project)}`;

  const handleExport = () => {
    setLoading(true);
    const imageLink = (
      <ResourceLink
        to={`/ui/project/${encodeURIComponent(project)}/images`}
        type="image"
        value={description}
      />
    );

    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = "download";
      a.click();
      window.URL.revokeObjectURL(url);

      toastNotify.success(
        <>
          镜像 {imageLink} 已开始下载，请检查下载文件夹。
        </>,
      );
    } catch (e) {
      toastNotify.failure(
        `镜像 ${description} 下载失败。`,
        e,
        imageLink,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ActionButton
      title={
        isUnifiedTarball ? "导出镜像" : "当前镜像格式不支持导出。"
      }
      aria-label="导出镜像"
      loading={isLoading}
      onClick={handleExport}
      className="has-icon"
      appearance="base"
      disabled={!isUnifiedTarball || isLoading}
    >
      <Icon name="export" />
    </ActionButton>
  );
};

export default DownloadImageBtn;
