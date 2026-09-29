import type { FC } from "react";
import { useState } from "react";
import { postClusterMemberState } from "api/cluster-members";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import type { LxdClusterMember } from "types/cluster";
import {
  CheckboxInput,
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import { useEventQueue } from "context/eventQueue";
import classnames from "classnames";
import ResourceLabel from "components/ResourceLabel";
import { useMemberLoading } from "context/memberLoading";
import { useServerEntitlements } from "util/entitlements/server";

interface Props {
  member: LxdClusterMember;
  hasLabel?: boolean;
  className?: string;
  onClose?: () => void;
}

const RestoreClusterMemberBtn: FC<Props> = ({
  member,
  hasLabel = false,
  className,
  onClose,
}) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const [mode, setMode] = useState("");
  const queryClient = useQueryClient();
  const eventQueue = useEventQueue();
  const memberLoading = useMemberLoading();
  const loadingType = memberLoading.getType(member.server_name);
  const { canEditServerConfiguration } = useServerEntitlements();

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.cluster],
      predicate: (query) =>
        query.queryKey[0] === queryKeys.cluster ||
        query.queryKey[0] === queryKeys.operations,
    });
  };

  const handleSuccess = () => {
    toastNotify.success(
      <>
        集群成员{" "}
        <ResourceLink
          type="cluster-member"
          value={member.server_name}
          to={`/ui/cluster/member/${encodeURIComponent(member.server_name)}`}
        />{" "}
        恢复完成。
      </>,
    );
  };

  const handleFailure = (msg: string) => {
    toastNotify.failure(
      "集群成员恢复失败",
      new Error(msg),
      <ResourceLink
        type="cluster-member"
        value={member.server_name}
        to={`/ui/cluster/member/${encodeURIComponent(member.server_name)}`}
      />,
    );
  };

  const handleRestore = () => {
    setLoading(true);
    postClusterMemberState(member, "restore", mode)
      .then((operation) => {
        toastNotify.info(
          <>
            集群成员{" "}
            <ResourceLink
              to={`/ui/cluster/member/${encodeURIComponent(member.server_name)}`}
              type="cluster-member"
              value={member.server_name}
            />{" "}
            恢复已开始。
          </>,
        );
        eventQueue.set(
          operation.metadata.id,
          handleSuccess,
          handleFailure,
          invalidateCache,
        );
        onClose?.();
      })
      .catch((e) => {
        notify.failure("集群成员恢复失败", e);
      })
      .finally(() => {
        setLoading(false);
        invalidateCache();
      });
  };

  const hasPermission = canEditServerConfiguration();

  const isDisabled =
    isLoading ||
    member.status !== "Evacuated" ||
    !!loadingType ||
    !hasPermission;

  return (
    <ConfirmationButton
      appearance={hasLabel ? "" : "base"}
      loading={isLoading || loadingType === "Restoring"}
      disabled={isDisabled}
      confirmationModalProps={{
        title: "确认恢复",
        children: (
          <>
            <CheckboxInput
              label="恢复实例"
              onChange={() => {
                setMode(mode === "" ? "skip" : "");
              }}
              checked={mode === ""}
            />
            <p className="p-form-help-text">
              选择是否恢复已停止或迁移的实例
            </p>
            <p>
              这将恢复集群成员{" "}
              <ResourceLabel
                type="cluster-member"
                value={member.server_name}
                bold
              />
              。
            </p>
          </>
        ),
        confirmButtonLabel: hasPermission
          ? "恢复集群成员"
          : "你没有权限恢复集群成员",
        onConfirm: handleRestore,
        confirmButtonAppearance: "positive",
      }}
      shiftClickEnabled
      title="恢复集群成员"
      className={classnames(className, "has-icon u-no-margin--bottom")}
    >
      <Icon name="play" />
      {hasLabel && <span>恢复</span>}
    </ConfirmationButton>
  );
};

export default RestoreClusterMemberBtn;
