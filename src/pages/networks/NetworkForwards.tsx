import type { FC } from "react";
import {
  Button,
  EmptyState,
  Icon,
  MainTable,
  Row,
  ScrollableTable,
  useNotify,
  Spinner,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { LxdNetwork } from "types/network";
import { fetchNetworkForwards } from "api/network-forwards";
import DeleteNetworkForwardBtn from "pages/networks/actions/DeleteNetworkForwardBtn";
import { Link } from "react-router-dom";
import ExpandableList from "components/ExpandableList";
import NetworkForwardPort from "pages/networks/NetworkForwardPort";
import { useNetworkEntitlements } from "util/entitlements/networks";
import { useIsClustered } from "context/useIsClustered";
import ResourceLink from "components/ResourceLink";
import { bridgeType } from "util/networks";
import DocLink from "components/DocLink";

interface Props {
  network: LxdNetwork;
  project: string;
}

const NetworkForwards: FC<Props> = ({ network, project }) => {
  const notify = useNotify();
  const { canEditNetwork } = useNetworkEntitlements();
  const isClustered = useIsClustered();
  const isClusterMemberSpecific = isClustered && network?.type === bridgeType;

  const {
    data: forwards = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      network.name,
      queryKeys.forwards,
    ],
    queryFn: async () => fetchNetworkForwards(network.name, project),
  });

  if (error) {
    notify.failure("加载网络转发失败", error);
  }

  const hasNetworkForwards = forwards.length > 0;

  const headers = [
    { content: "监听地址", sortKey: "listenAddress" },
    { content: "描述", sortKey: "description" },
    {
      content: "默认目标地址",
      sortKey: "defaultTarget",
    },
    { content: "端口" },
    ...(isClusterMemberSpecific
      ? [
          {
            content: "位置",
            sortKey: "location",
          },
        ]
      : []),
    {
      "aria-label": "操作",
      className: "u-align--right actions",
    },
  ];

  const rows = forwards.map((forward) => {
    return {
      key: forward.listen_address,
      columns: [
        {
          content: forward.listen_address,
          role: "rowheader",
          "aria-label": "监听地址",
        },
        {
          content: forward.description,
          role: "cell",
          "aria-label": "描述",
        },
        {
          content: forward.config.target_address,
          role: "cell",
          "aria-label": "默认目标地址",
        },
        {
          content: (
            <ExpandableList
              items={forward.ports.map((port) => (
                <NetworkForwardPort key={port.listen_port} port={port} />
              ))}
            />
          ),
          role: "cell",
          "aria-label": "转发端口",
        },
        ...(isClusterMemberSpecific
          ? [
              {
                content: (
                  <ResourceLink
                    type="cluster-member"
                    value={forward.location ?? ""}
                    to={`/ui/cluster/member/${encodeURIComponent(forward.location ?? "")}`}
                  />
                ),
                role: "cell",
              },
            ]
          : []),
        {
          content: (
            <>
              {canEditNetwork(network) && (
                <Link
                  className="p-button--base u-no-margin--bottom has-icon"
                  to={
                    isClusterMemberSpecific
                      ? `/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network.name)}/member/${encodeURIComponent(forward.location ?? "")}/forwards/${encodeURIComponent(forward.listen_address)}/edit`
                      : `/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network.name)}/forwards/${encodeURIComponent(forward.listen_address)}/edit`
                  }
                  title="编辑网络转发"
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
                  title="您没有权限编辑此网络的前向转发"
                  disabled
                >
                  <Icon name="edit" />
                </Button>
              )}
              <DeleteNetworkForwardBtn
                key={forward.listen_address + forward.location}
                network={network}
                forward={forward}
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
        listenAddress: forward.listen_address,
        description: forward.description,
        defaultTarget: forward.config.target_address ?? "",
        location: forward.location,
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
          to={`/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network.name)}/forwards/create`}
        >
          创建转发
        </Link>
      )}
      {!canEditNetwork(network) && (
        <Button
          appearance="positive"
          className="u-float-right u-no-margin--bottom"
          disabled
          title="您没有权限为此网络创建前向转发"
        >
          <span>创建转发</span>
        </Button>
      )}
      <Row>
        {hasNetworkForwards && (
          <ScrollableTable
            dependencies={forwards}
            tableId="network-forwards-table"
            belowIds={["status-bar"]}
          >
            <MainTable
              id="network-forwards-table"
              headers={headers}
              expanding
              rows={rows}
              paginate={30}
              sortable
              defaultSort="listenAddress"
              defaultSortDirection="ascending"
              className="u-table-layout--auto network-forwards-table"
              emptyStateMsg="暂无数据"
            />
          </ScrollableTable>
        )}
        {!isLoading && !hasNetworkForwards && (
          <EmptyState
            className="empty-state"
            image={<Icon className="empty-state-icon" name="exposed" />}
            title="未找到网络转发"
          >
            <p>该网络下没有网络转发。</p>
            <p>
              <DocLink docPath="/howto/network_forwards/" hasExternalIcon>
                了解更多关于网络转发的信息
              </DocLink>
            </p>
          </EmptyState>
        )}
      </Row>
    </>
  );
};

export default NetworkForwards;
