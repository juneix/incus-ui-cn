import type { FC } from "react";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ActionButton,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useFormik } from "formik";
import type { NetworkLoadBalancerFormValues } from "pages/networks/forms/NetworkLoadBalancerForm";
import NetworkLoadBalancerForm, {
  NetworkLoadBalancerSchema,
  toNetworkLoadBalancer,
} from "pages/networks/forms/NetworkLoadBalancerForm";
import {
  fetchNetworkLoadBalancer,
  updateNetworkLoadBalancer,
} from "api/network-load-balancers";
import { Link, useNavigate, useParams } from "react-router-dom";
import BaseLayout from "components/BaseLayout";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useNetwork } from "context/useNetworks";
import type {
  LxdNetworkLoadBalancerBackend,
  LxdNetworkLoadBalancerPort,
} from "types/network";

const EditNetworkLoadBalancer: FC = () => {
  const docBaseLink = useDocs();
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const {
    network: networkName,
    project,
    listenAddress,
  } = useParams<{
    network: string;
    project: string;
    listenAddress: string;
  }>();

  const { data: network, error } = useNetwork(networkName ?? "", project ?? "");

  useEffect(() => {
    if (error) {
      notify.failure("加载网络失败", error);
    }
  }, [error]);

  const { data: loadBalancer } = useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      networkName,
      queryKeys.loadBalancers,
      listenAddress,
    ],
    queryFn: async () =>
      fetchNetworkLoadBalancer(
        networkName ?? "",
        listenAddress ?? "",
        project ?? "",
      ),
  });

  const formik = useFormik<NetworkLoadBalancerFormValues>({
    initialValues: {
      listenAddress: listenAddress ?? "",
      description: loadBalancer?.description ?? "",
      ports:
        loadBalancer?.ports?.map((port: LxdNetworkLoadBalancerPort) => ({
          listenPort: port.listen_port,
          protocol: port.protocol,
          targetBackend: port.target_backend.join(","),
        })) ?? [],
      backends:
        loadBalancer?.backends?.map(
          (backend: LxdNetworkLoadBalancerBackend) => ({
            name: backend.name,
            targetAddress: backend.target_address,
            targetPort: backend.target_port ?? "",
          }),
        ) ?? [],
      location: loadBalancer?.location,
    },
    enableReinitialize: true,
    validationSchema: NetworkLoadBalancerSchema,
    onSubmit: (values) => {
      const loadBalancer = toNetworkLoadBalancer(values);

      updateNetworkLoadBalancer(networkName ?? "", loadBalancer, project ?? "")
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.projects,
              project,
              queryKeys.networks,
              networkName,
              queryKeys.loadBalancers,
            ],
          });
          navigate(
            `/ui/project/${encodeURIComponent(project ?? "")}/network/${encodeURIComponent(networkName ?? "")}/load-balancers`,
          );
          toastNotify.success(
            `网络负载均衡 ${loadBalancer.listen_address} 已更新。`,
          );
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("更新网络负载均衡失败", e);
        });
    },
  });

  return (
    <BaseLayout
      title={
        <HelpLink
          href={`${docBaseLink}/howto/network_load_balancers/`}
          title="了解更多关于网络负载均衡的信息"
        >
          编辑网络负载均衡
        </HelpLink>
      }
      contentClassName="edit-network"
    >
      <NetworkLoadBalancerForm formik={formik} isEdit network={network} />
      <FormFooterLayout>
        <Link
          className="p-button--base"
          to={`/ui/project/${encodeURIComponent(project ?? "")}/network/${encodeURIComponent(networkName ?? "")}/load-balancers`}
        >
          取消
        </Link>
        <ActionButton
          appearance="positive"
          loading={formik.isSubmitting}
          disabled={
            !formik.isValid ||
            formik.isSubmitting ||
            !formik.values.listenAddress
          }
          onClick={() => void formik.submitForm()}
        >
          更新
        </ActionButton>
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default EditNetworkLoadBalancer;
