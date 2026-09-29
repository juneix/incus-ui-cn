import type { FC } from "react";
import { useState } from "react";
import type { LxdNetwork, LxdNetworkLoadBalancer } from "types/network";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { deleteNetworkLoadBalancer } from "api/network-load-balancers";
import { useNetworkEntitlements } from "util/entitlements/networks";

interface Props {
  network: LxdNetwork;
  loadBalancer: LxdNetworkLoadBalancer;
  project: string;
}

const DeleteNetworkLoadBalancerBtn: FC<Props> = ({
  network,
  loadBalancer,
  project,
}) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const { canEditNetwork } = useNetworkEntitlements();

  const handleDelete = () => {
    setLoading(true);
    deleteNetworkLoadBalancer(network, loadBalancer, project)
      .then(() => {
        toastNotify.success(
          `监听地址为 ${loadBalancer.listen_address} 的网络负载均衡已删除。`,
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
        notify.failure("删除网络负载均衡失败", e);
      });
  };

  return (
    <ConfirmationButton
      appearance="base"
      onHoverText={
        canEditNetwork(network)
          ? "删除网络负载均衡"
          : "您没有权限删除此网络负载均衡"
      }
      confirmationModalProps={{
        title: "确认删除",
        confirmButtonAppearance: "negative",
        confirmButtonLabel: "删除",
        children: (
          <p>
            确定要删除监听地址为 {loadBalancer.listen_address} 的网络负载均衡吗？<br />
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

export default DeleteNetworkLoadBalancerBtn;
