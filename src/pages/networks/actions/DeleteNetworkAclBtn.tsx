import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LxdNetworkAcl } from "types/network";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import ResourceLabel from "components/ResourceLabel";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import classnames from "classnames";
import { useNetworkAclEntitlements } from "util/entitlements/network-acls";
import { deleteNetworkAcl } from "api/network-acls";

interface Props {
  networkAcl: LxdNetworkAcl;
  project: string;
}

const DeleteNetworkAclBtn: FC<Props> = ({ networkAcl, project }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isSmallScreen = useIsScreenBelow();
  const { canDeleteNetworkAcl } = useNetworkAclEntitlements();

  const handleDelete = () => {
    setLoading(true);
    deleteNetworkAcl(networkAcl.name, project)
      .then(() => {
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === queryKeys.projects &&
            query.queryKey[1] === project &&
            query.queryKey[2] === queryKeys.networkAcls,
        });
        navigate(`/ui/project/${encodeURIComponent(project)}/network-acls`);
        toastNotify.success(
          <>
            网络 ACL{" "}
            <ResourceLabel bold type="network-acl" value={networkAcl.name} />{" "}
            已删除。
          </>,
        );
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("删除 ACL 失败", e);
      });
  };

  const isUsed = (networkAcl.used_by?.length ?? 0) > 0;

  const getOnHoverText = () => {
    if (!canDeleteNetworkAcl(networkAcl)) {
      return "您没有权限删除此 ACL";
    }

    if (isUsed) {
      return "无法删除，该 ACL 当前正在使用中";
    }

    return "";
  };

  return (
    <ConfirmationButton
      onHoverText={getOnHoverText()}
      confirmationModalProps={{
        title: "确认删除",
        confirmButtonAppearance: "negative",
        confirmButtonLabel: "删除",
        children: (
          <p>
            确定要删除网络 ACL{" "}
            <ResourceLabel type="network-acl" value={networkAcl.name} bold /> 吗？
            <br />
            此操作无法撤销，并可能导致数据丢失。
          </p>
        ),
        onConfirm: handleDelete,
      }}
      className={classnames("u-no-margin--bottom", {
        "has-icon": !isSmallScreen,
      })}
      loading={isLoading}
      disabled={!canDeleteNetworkAcl(networkAcl) || isUsed || isLoading}
      shiftClickEnabled
      showShiftClickHint
    >
      {!isSmallScreen && <Icon name="delete" />}
      <span>删除 ACL</span>
    </ConfirmationButton>
  );
};

export default DeleteNetworkAclBtn;
