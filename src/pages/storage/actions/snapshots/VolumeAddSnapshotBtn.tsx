import type { FC } from "react";
import type { LxdStorageVolume } from "types/storage";
import { Button, Icon, Tooltip, usePortal } from "@canonical/react-components";
import CreateVolumeSnapshotForm from "pages/storage/forms/CreateVolumeSnapshotForm";
import { useStorageVolumeEntitlements } from "util/entitlements/storage-volumes";

interface Props {
  volume: LxdStorageVolume;
  isCTA?: boolean;
  isDisabled?: boolean;
  className?: string;
}

const VolumeAddSnapshotBtn: FC<Props> = ({
  volume,
  isCTA,
  isDisabled,
  className,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { canManageStorageVolumeSnapshots } = useStorageVolumeEntitlements();

  const getDisabledReason = () => {
    if (isDisabled) {
      return `项目 ${volume.project} 已禁用快照创建`;
    }
    if (!canManageStorageVolumeSnapshots(volume)) {
      return "您没有权限为此存储卷创建快照。";
    }
    return "添加快照";
  };

  return (
    <>
      {isOpen ? (
        <Portal>
          <CreateVolumeSnapshotForm volume={volume} close={closePortal} />
        </Portal>
      ) : null}
      {isCTA ? (
        <Button
          appearance="base"
          hasIcon
          dense={true}
          onClick={openPortal}
          type="button"
          aria-label="添加快照"
          title={getDisabledReason()}
          disabled={isDisabled || !canManageStorageVolumeSnapshots(volume)}
          className={className}
        >
          <Icon name="add-canvas" />
        </Button>
      ) : (
        <Button
          appearance="positive"
          className={className}
          onClick={openPortal}
          disabled={isDisabled || !canManageStorageVolumeSnapshots(volume)}
          title={getDisabledReason()}
        >
          {isDisabled ? (
            <Tooltip
              message={`项目 ${volume.project} 中已禁用存储卷的快照创建`}
            >
              创建快照
            </Tooltip>
          ) : (
            "创建快照"
          )}
        </Button>
      )}
    </>
  );
};

export default VolumeAddSnapshotBtn;
