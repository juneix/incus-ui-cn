import type { FC } from "react";
import { useState } from "react";
import type { LxdNetwork, LxdNetworkForward } from "types/network";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { deleteNetworkForward } from "api/network-forwards";
import { useNetworkEntitlements } from "util/entitlements/networks";
import ResourceLabel from "components/ResourceLabel";

interface Props {
  network: LxdNetwork;
  forward: LxdNetworkForward;
  project: string;
}

const DeleteNetworkForwardBtn: FC<Props> = ({ network, forward, project }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const { canEditNetwork } = useNetworkEntitlements();

  const handleDelete = () => {
    setLoading(true);
    deleteNetworkForward(network, forward, project)
      .then(() => {
        toastNotify.success(
          <>
            监听地址为{" "}
            <ResourceLabel
              type="network-forward"
              value={forward.listen_address}
              bold
            />{" "}
            的网络转发已删除。
          </>,
        );
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === queryKeys.projects &&
            query.queryKey[1] === project &&
            query.queryKey[2] === queryKeys.networks &&
            query.queryKey[3] === network.name,
        });
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("删除网络转发失败", e);
      });
  };

  return (
    <ConfirmationButton
      appearance="base"
      onHoverText={
        canEditNetwork(network)
          ? "删除网络转发"
          : "您没有权限删除此网络转发"
      }
      confirmationModalProps={{
        title: "确认删除",
        confirmButtonAppearance: "negative",
        confirmButtonLabel: "删除",
        children: (
          <p>
            确定要删除监听地址为{" "}
            <ResourceLabel
              type="network-forward"
              value={forward.listen_address}
              bold
            />{" "}
            的网络转发吗？<br />
          </p>
        ),
        onConfirm: handleDelete,
      }}
      className="u-no-margin--bottom has-icon"
      loading={isLoading}
      shiftClickEnabled
      showShiftClickHint
      disabled={!canEditNetwork(network) || isLoading}
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteNetworkForwardBtn;
