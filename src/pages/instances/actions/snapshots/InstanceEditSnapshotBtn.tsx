import type { FC, ReactNode } from "react";
import { Button, Icon, usePortal } from "@canonical/react-components";
import type { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import EditInstanceSnapshotForm from "pages/instances/forms/EditInstanceSnapshotForm";

interface Props {
  instance: LxdInstance;
  snapshot: LxdInstanceSnapshot;
  onSuccess: (message: ReactNode) => void;
  isDeleting: boolean;
  isRestoring: boolean;
  disabledReason?: string;
}

const InstanceEditSnapshotBtn: FC<Props> = ({
  instance,
  snapshot,
  onSuccess,
  isDeleting,
  isRestoring,
  disabledReason,
}) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  return (
    <>
      {isOpen && (
        <Portal>
          <EditInstanceSnapshotForm
            close={closePortal}
            instance={instance}
            onSuccess={onSuccess}
            snapshot={snapshot}
          />
        </Portal>
      )}
      <Button
        appearance="base"
        hasIcon
        dense={true}
        disabled={isDeleting || isRestoring || !!disabledReason}
        onClick={openPortal}
        type="button"
        aria-label="编辑快照"
        title={disabledReason ?? "编辑"}
      >
        <Icon name="edit" />
      </Button>
    </>
  );
};

export default InstanceEditSnapshotBtn;
