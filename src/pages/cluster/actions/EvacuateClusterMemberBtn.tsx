import type { FC } from "react";
import { useState } from "react";
import { postClusterMemberState } from "api/cluster-members";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import type { LxdClusterMember } from "types/cluster";
import {
  ConfirmationButton,
  Icon,
  Select,
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

const EvacuateClusterMemberBtn: FC<Props> = ({
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
        撤离完成。
      </>,
    );
  };

  const handleFailure = (msg: string) => {
    toastNotify.failure(
      "集群成员撤离失败",
      new Error(msg),
      <ResourceLink
        type="cluster-member"
        value={member.server_name}
        to={`/ui/cluster/member/${encodeURIComponent(member.server_name)}`}
      />,
    );
  };

  const handleEvacuate = () => {
    setLoading(true);
    postClusterMemberState(member, "evacuate", mode)
      .then((operation) => {
        toastNotify.info(
          <>
            集群成员{" "}
            <ResourceLink
              type="cluster-member"
              value={member.server_name}
              to={`/ui/cluster/member/${encodeURIComponent(member.server_name)}`}
            />{" "}
            撤离已开始。
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
        notify.failure("集群成员撤离失败", e);
      })
      .finally(() => {
        setLoading(false);
        invalidateCache();
      });
  };

  const hasPermission = canEditServerConfiguration();
  const isDisabled =
    isLoading || member.status !== "Online" || !!loadingType || !hasPermission;

  return (
    <ConfirmationButton
      appearance={hasLabel ? "" : "base"}
      loading={isLoading || loadingType === "Evacuating"}
      disabled={isDisabled}
      confirmationModalProps={{
        title: "确认撤离",
        children: (
          <>
            <Select
              label="撤离操作"
              options={[
                { label: "自动", value: "" },
                {
                  label: "停止所有实例",
                  value: "stop",
                },
                {
                  label: "迁移实例到其他成员",
                  value: "migrate",
                },
                {
                  label: "热迁移实例到其他成员",
                  value: "live-migrate",
                },
              ]}
              help="选择如何处理该成员上的实例。"
              onChange={(e) => {
                setMode(e.target.value);
              }}
              value={mode}
            />
            <p>
              这将撤离集群成员{" "}
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
          ? "撤离集群成员"
          : "你没有权限撤离集群成员",
        onConfirm: handleEvacuate,
      }}
      shiftClickEnabled
      title="撤离集群成员"
      className={classnames(className, "has-icon u-no-margin--bottom")}
    >
      <Icon name="stop" />
      {hasLabel && <span>撤离</span>}
    </ConfirmationButton>
  );
};

export default EvacuateClusterMemberBtn;
