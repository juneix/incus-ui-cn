import type { FC } from "react";
import {
  Button,
  EmptyState,
  Icon,
  MainTable,
  Row,
  ScrollableTable,
  Spinner,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { LxdNetwork } from "types/network";
import Loader from "components/Loader";
import { fetchNetworkLoadBalancers } from "api/network-load-balancers";
import { useDocs } from "context/useDocs";
import DeleteNetworkLoadBalancerBtn from "pages/networks/actions/DeleteNetworkLoadBalancerBtn";
import { Link } from "react-router-dom";
import ExpandableList from "components/ExpandableList";
import NetworkLoadBalancerPort from "pages/networks/NetworkLoadBalancerPort";
import { useNetworkEntitlements } from "util/entitlements/networks";
import ResourceLink from "components/ResourceLink";
import { bridgeType } from "util/networks";

interface Props {
  network: LxdNetwork;
  project: string;
}

const NetworkLoadBalancers: FC<Props> = ({ network, project }) => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const { canEditNetwork } = useNetworkEntitlements();

  const {
    data: loadBalancers = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      network.name,
      queryKeys.loadBalancers,
    ],
    queryFn: async () => fetchNetworkLoadBalancers(network.name, project),
  });

  if (error) {
    notify.failure("加载网络负载均衡失败", error);
  }

  const hasNetworkLoadBalancers = loadBalancers.length > 0;

  const headers = [
    { content: "监听地址", sortKey: "listenAddress" },
    { content: "描述", sortKey: "description" },
    { content: "端口" },
    {
      "aria-label": "操作",
      className: "u-align--right actions",
    },
  ];

  const rows = loadBalancers.map((loadBalancer) => {
    return {
      key: loadBalancer.listen_address,
      columns: [
        {
          content: loadBalancer.listen_address,
          role: "rowheader",
          "aria-label": "监听地址",
        },
        {
          content: loadBalancer.description,
          role: "cell",
          "aria-label": "描述",
        },
        {
          content: (
            <ExpandableList
              items={
                loadBalancer.ports?.map((port) => (
                  <NetworkLoadBalancerPort key={port.listen_port} port={port} />
                )) ?? []
              }
            />
          ),
          role: "cell",
          "aria-label": "转发端口",
        },
        {
          content: (
            <>
              {canEditNetwork(network) && (
                <Link
                  className="p-button--base u-no-margin--bottom has-icon"
                  to={`/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network.name)}/load-balancers/${encodeURIComponent(loadBalancer.listen_address)}/edit`}
                  title="编辑网络负载均衡"
                >
                  <Icon name="edit" />
                </Link>
              )}
              {!canEditNetwork(network) && (
                <Button
                  key="edit"
                  appearance="base"
                  className="u-no-margin--bottom"
                  dense
                  hasIcon
                  type="button"
                  title="您没有权限编辑此网络上的负载均衡"
                  disabled
                >
                  <Icon name="edit" />
                </Button>
              )}
              <DeleteNetworkLoadBalancerBtn
                key={loadBalancer.listen_address}
                network={network}
                loadBalancer={loadBalancer}
                project={project}
              />
            </>
          ),
          role: "cell",
          className: "u-align--right actions",
          "aria-label": "操作",
        },
      ],
      sortData: {
        listenAddress: loadBalancer.listen_address,
        description: loadBalancer.description,
      },
    };
  });

  if (isLoading) {
    return <Spinner className="u-loader" text="正在加载..." isMainComponent />;
  }

  return (
    <>
      {canEditNetwork(network) && (
        <Link
          className="p-button--positive u-no-margin--bottom u-float-right"
          to={`/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network.name)}/load-balancers/create`}
        >
          创建负载均衡
        </Link>
      )}
      {!canEditNetwork(network) && (
        <Button
          appearance="positive"
          className="u-float-right u-no-margin--bottom"
          disabled
          title="您没有权限为此网络创建负载均衡"
        >
          <span>创建负载均衡</span>
        </Button>
      )}
      <Row>
        {hasNetworkLoadBalancers && (
          <ScrollableTable
            dependencies={loadBalancers}
            tableId="network-loadbalancers-table"
            belowIds={["status-bar"]}
          >
            <MainTable
              id="network-load-balancers-table"
              headers={headers}
              expanding
              rows={rows}
              paginate={30}
              sortable
              defaultSort="listenAddress"
              defaultSortDirection="ascending"
              className="u-table-layout--auto network-load-balancers-table"
              emptyStateMsg="暂无数据"
            />
          </ScrollableTable>
        )}
        {!isLoading && !hasNetworkLoadBalancers && (
          <EmptyState
            className="empty-state"
            image={<Icon className="empty-state-icon" name="exposed" />}
            title="未找到网络负载均衡"
          >
            <p>该网络下没有负载均衡。</p>
            <p>
              <a
                href={`${docBaseLink}/howto/network_load_balancers/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                了解更多关于网络负载均衡的信息
                <Icon className="external-link-icon" name="external-link" />
              </a>
            </p>
          </EmptyState>
        )}
      </Row>
    </>
  );
};

export default NetworkLoadBalancers;
