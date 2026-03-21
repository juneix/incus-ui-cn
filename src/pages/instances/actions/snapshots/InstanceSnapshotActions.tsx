import type { FC, ReactNode } from "react";
import { useState } from "react";
import type { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import {
  deleteInstanceSnapshot,
  restoreInstanceSnapshot,
} from "api/instance-snapshots";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { ConfirmationButton, Icon, List } from "@canonical/react-components";
import classnames from "classnames";
import ConfirmationForce from "components/ConfirmationForce";
import { useEventQueue } from "context/eventQueue";
import InstanceEditSnapshotBtn from "./InstanceEditSnapshotBtn";
import CreateImageFromInstanceSnapshotBtn from "pages/instances/actions/snapshots/CreateImageFromInstanceSnapshotBtn";
import CreateInstanceFromSnapshotBtn from "./CreateInstanceFromSnapshotBtn";
import ResourceLabel from "components/ResourceLabel";
import InstanceSnapshotLinkChip from "pages/instances/InstanceSnapshotLinkChip";
import InstanceLinkChip from "pages/instances/InstanceLinkChip";
import { useInstanceEntitlements } from "util/entitlements/instances";

interface Props {
  instance: LxdInstance;
  snapshot: LxdInstanceSnapshot;
  onSuccess: (message: ReactNode) => void;
  onFailure: (title: string, e: unknown) => void;
}

const InstanceSnapshotActions: FC<Props> = ({
  instance,
  snapshot,
  onSuccess,
  onFailure,
}) => {
  const eventQueue = useEventQueue();
  const [isDeleting, setDeleting] = useState(false);
  const [isRestoring, setRestoring] = useState(false);
  const [restoreState, setRestoreState] = useState(true);
  const queryClient = useQueryClient();
  const { canManageInstanceSnapshots } = useInstanceEntitlements();
  const disabledReason = canManageInstanceSnapshots(instance)
    ? undefined
    : "你没有管理此实例快照的权限";

  const handleDelete = () => {
    setDeleting(true);
    deleteInstanceSnapshot(instance, snapshot)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            onSuccess(
              <>
                快照{" "}
                <ResourceLabel bold type="snapshot" value={snapshot.name} />{" "}
                已从实例 <InstanceLinkChip instance={instance} /> 中删除。
              </>,
            );
          },
          (msg) => {
            onFailure("删除快照失败", new Error(msg));
          },
          () => {
            setDeleting(false);
            queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === queryKeys.instances,
            });
          },
        );
      })
      .catch((e) => {
        onFailure("删除快照失败", e);
        setDeleting(false);
      });
  };

  const handleRestore = () => {
    setRestoring(true);
    restoreInstanceSnapshot(instance, snapshot, restoreState)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            onSuccess(
              <>
                快照{" "}
                <InstanceSnapshotLinkChip
                  name={snapshot.name}
                  instance={instance}
                />{" "}
                已恢复到实例 <InstanceLinkChip instance={instance} />。
              </>,
            );
          },
          (msg) => {
            onFailure("恢复快照失败", new Error(msg));
          },
          () => {
            setRestoring(false);
            queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === queryKeys.instances,
            });
          },
        );
      })
      .catch((e) => {
        onFailure("恢复快照失败", e);
        setRestoring(false);
      });
  };

  return (
    <>
      <List
        inline
        className={classnames("u-no-margin--bottom", "actions-list", {
          "u-snapshot-actions": !isDeleting && !isRestoring,
        })}
        items={[
          <InstanceEditSnapshotBtn
            key="edit"
            instance={instance}
            snapshot={snapshot}
            onSuccess={onSuccess}
            isDeleting={isDeleting}
            isRestoring={isRestoring}
            disabledReason={disabledReason}
          />,
          <ConfirmationButton
            key="restore"
            appearance="base"
            loading={isRestoring}
            className="has-icon is-dense"
            title="确认恢复"
            confirmationModalProps={{
              title: "确认恢复",
              children: (
                <p>
                  这将恢复快照{" "}
                  <ResourceLabel type="snapshot" value={snapshot.name} bold />.
                  <br />
                  此操作无法撤销，并且可能导致数据丢失。
                </p>
              ),
              confirmExtra: snapshot.stateful ? (
                <ConfirmationForce
                  label="恢复实例状态"
                  force={[restoreState, setRestoreState]}
                />
              ) : undefined,
              confirmButtonLabel: disabledReason ?? "恢复快照",
              confirmButtonAppearance: "positive",
              close: () => {
                setRestoreState(true);
              },
              onConfirm: handleRestore,
            }}
            disabled={isDeleting || isRestoring || !!disabledReason}
            shiftClickEnabled
            showShiftClickHint
          >
            <Icon name="change-version" />
          </ConfirmationButton>,
          <CreateImageFromInstanceSnapshotBtn
            key="publish"
            instance={instance}
            snapshot={snapshot}
            isRestoring={isRestoring}
            isDeleting={isDeleting}
          />,
          <CreateInstanceFromSnapshotBtn
            key="duplicate"
            instance={instance}
            snapshot={snapshot}
            isDeleting={isDeleting}
            isRestoring={isRestoring}
          />,
          <ConfirmationButton
            key="delete"
            appearance="base"
            loading={isDeleting}
            className="has-icon is-dense"
            confirmationModalProps={{
              title: "确认删除",
              children: (
                <p>
                  这将永久删除快照{" "}
                  <ResourceLabel type="snapshot" value={snapshot.name} bold />.
                  <br />
                  此操作无法撤销，并且可能导致数据丢失。
                </p>
              ),
              confirmButtonLabel: disabledReason ?? "删除快照",
              onConfirm: handleDelete,
            }}
            disabled={isDeleting || isRestoring || !!disabledReason}
            shiftClickEnabled
            showShiftClickHint
          >
            <Icon name="delete" />
          </ConfirmationButton>,
        ]}
      />
    </>
  );
};

export default InstanceSnapshotActions;
