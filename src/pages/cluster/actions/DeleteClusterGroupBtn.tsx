import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteClusterGroup } from "api/cluster-groups";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import {
  ConfirmationButton,
  Icon,
  useToastNotification,
} from "@canonical/react-components";
import ResourceLabel from "components/ResourceLabel";
import { useServerEntitlements } from "util/entitlements/server";

interface Props {
  group: string;
}

const DeleteClusterGroupBtn: FC<Props> = ({ group }) => {
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { canEditServerConfiguration } = useServerEntitlements();

  const hasPermission = canEditServerConfiguration();

  const handleDelete = () => {
    setLoading(true);
    deleteClusterGroup(group)
      .then(() => {
        navigate(`/ui/cluster/groups`);
        toastNotify.success(
          <>
            集群组{" "}
            <ResourceLabel type="cluster-group" value={group} bold /> 已删除。
          </>,
        );
      })
      .catch((e) => {
        setLoading(false);
        toastNotify.failure("删除集群组失败", e);
      })
      .finally(() => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.cluster, queryKeys.groups],
        });
      });
  };

  const isDefaultGroup = group === "default";
  const getHoverText = () => {
    if (isDefaultGroup) {
      return "默认集群组无法删除";
    }
    if (!hasPermission) {
      return "你没有权限删除集群组";
    }
    return "删除集群组";
  };

  return (
    <ConfirmationButton
      onHoverText={getHoverText()}
      appearance="base"
      loading={isLoading}
      confirmationModalProps={{
        title: "确认删除",
        children: (
          <p>
            这将永久删除集群组{" "}
            <ResourceLabel type="cluster-group" value={group} bold />。
          </p>
        ),
        confirmButtonLabel: "删除",
        onConfirm: handleDelete,
      }}
      disabled={isDefaultGroup || isLoading || !hasPermission}
      shiftClickEnabled
      showShiftClickHint
      title="删除集群组"
      className="has-icon"
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteClusterGroupBtn;
