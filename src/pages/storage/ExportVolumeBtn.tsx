import type { FC } from "react";
import { Button, Icon, usePortal } from "@canonical/react-components";
import classNames from "classnames";
import type { LxdStorageVolume } from "types/storage";
import ExportVolumeModal from "./forms/ExportVolumeModal";
import { useStorageVolumeEntitlements } from "util/entitlements/storage-volumes";
import { useCurrentProject } from "context/useCurrentProject";
import { isBackupDisabled } from "util/snapshots";

interface Props {
  volume: LxdStorageVolume;
  classname?: string;
  onClose?: () => void;
}

const ExportVolumeBtn: FC<Props> = ({ volume, classname, onClose }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canManageVolumeBackups } = useStorageVolumeEntitlements();
  const { project } = useCurrentProject();
  const backupDisabled = isBackupDisabled(project);

  const handleClose = () => {
    closePortal();
    onClose?.();
  };

  const getTitle = () => {
    if (!canManageVolumeBackups(volume)) {
      return "你没有导出此存储卷的权限。";
    }

    if (backupDisabled) {
      return `项目 "${project?.name}" 不允许创建备份。`;
    }

    return "导出存储卷";
  };

  return (
    <>
      {isOpen && (
        <Portal>
          <ExportVolumeModal close={handleClose} volume={volume} />
        </Portal>
      )}
      <Button
        appearance="default"
        className={classNames("u-no-margin--bottom has-icon", classname)}
        onClick={openPortal}
        title={getTitle()}
        disabled={!canManageVolumeBackups(volume) || backupDisabled}
      >
        <Icon name="export" />
        <span>导出</span>
      </Button>
    </>
  );
};

export default ExportVolumeBtn;
