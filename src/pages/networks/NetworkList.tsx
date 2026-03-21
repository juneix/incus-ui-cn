import type { FC } from "react";
import { useEffect } from "react";
import {
  Button,
  EmptyState,
  Icon,
  MainTable,
  Row,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import NetworkForwardCount from "pages/networks/NetworkForwardCount";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { renderNetworkType } from "util/networks";
import { useClusterMembers } from "context/useClusterMembers";
import PageHeader from "components/PageHeader";
import type { NetworkFilters } from "pages/networks/NetworkSearchFilter";
import NetworkSearchFilter, {
  MANAGED,
  MEMBER,
  STATE,
  TYPE,
  QUERY,
} from "pages/networks/NetworkSearchFilter";
import type { LXDNetworkOnClusterMember } from "types/network";
import NetworkClusterMemberChip from "pages/networks/NetworkClusterMemberChip";
import {
  useNetworks,
  useNetworksFromClusterMembers,
} from "context/useNetworks";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useCurrentProject } from "context/useCurrentProject";
import DocLink from "components/DocLink";

const NetworkList: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const isSmallScreen = useIsScreenBelow();
  const { data: clusterMembers = [] } = useClusterMembers();
  const isClustered = clusterMembers.length > 0;
  const [searchParams] = useSearchParams();
  const { canCreateNetworks } = useProjectEntitlements();
  const { project: currentProject } = useCurrentProject();

  const filters: NetworkFilters = {
    queries: searchParams.getAll(QUERY),
    type: searchParams.getAll(TYPE).map((value) => value.toLowerCase()),
    managed: searchParams.getAll(MANAGED).map((value) => value.toLowerCase()),
    member: searchParams.getAll(MEMBER),
    state: searchParams.getAll(STATE),
  };

  if (!project) {
    return <>缺少项目参数</>;
  }

  const { data: networks = [], error, isLoading } = useNetworks(project);

  useEffect(() => {
    if (error) {
      notify.failure("加载网络失败", error);
    }
  }, [error]);

  const {
    data: networksOnClusterMembers = [],
    error: clusterNetworkError,
    isLoading: isClusterNetworksLoading,
  } = useNetworksFromClusterMembers(project);

  useEffect(() => {
    if (clusterNetworkError) {
      notify.failure("加载集群网络失败", clusterNetworkError);
    }
  }, [clusterNetworkError]);

  const renderNetworks: LXDNetworkOnClusterMember[] = networks
    .filter((network) => !isClustered || network.managed)
    .map((network) => {
      return {
        ...network,
        memberName: "集群范围",
      };
    });
  networksOnClusterMembers.forEach((network) => {
    if (!network.managed) {
      renderNetworks.push(network);
    }
  });

  const hasNetworks = renderNetworks.length > 0;

  const headers = [
    { content: "名称", sortKey: "name" },
    { content: "类型", sortKey: "type", className: "type" },
    { content: "受管", sortKey: "managed", className: "managed" },
    ...(isClustered ? [{ content: "集群成员", sortKey: "member" }] : []),
    { content: "IPV4", className: "u-align--right" },
    { content: "IPV6" },
    {
      content: "描述",
      sortKey: "description",
    },
    { content: "转发", className: "u-align--right forwards" },
    {
      content: "被使用数",
      sortKey: "usedBy",
      className: "u-align--right used-by",
    },
    { content: "状态", sortKey: "state", className: "state" },
  ];

  const rows = renderNetworks
    .filter((network) => {
      if (
        !filters.queries.every(
          (q) =>
            network.name.toLowerCase().includes(q) ||
            network.description?.toLowerCase().includes(q),
        )
      ) {
        return false;
      }
      if (filters.type.length > 0 && !filters.type.includes(network.type)) {
        return false;
      }
      if (
        filters.managed.length > 0 &&
        !filters.managed.includes(network.managed ? "yes" : "no") &&
        !filters.managed.includes(network.managed ? "是" : "否")
      ) {
        return false;
      }
      if (
        filters.member.length > 0 &&
        !filters.member.includes(network.memberName) &&
        !(
          network.memberName === "集群范围" &&
          filters.member.includes("Cluster-wide")
        )
      ) {
        return false;
      }
      if (
        filters.state.length > 0 &&
        !filters.state.includes(network.status ?? "")
      ) {
        return false;
      }
      return true;
    })
    .map((network) => {
      const href =
        network.memberName === "集群范围"
          ? `/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network.name)}`
          : `/ui/project/${encodeURIComponent(project)}/member/${encodeURIComponent(network.memberName)}/network/${encodeURIComponent(network.name)}`;

      return {
        key: network.name + network.memberName,
        columns: [
          {
            content: <Link to={href}>{network.name}</Link>,
            role: "rowheader",
            "aria-label": "名称",
          },
          {
            content: renderNetworkType(network.type),
            role: "cell",
            "aria-label": "类型",
            className: "type",
          },
          {
            content: network.managed ? "是" : "否",
            role: "cell",
            "aria-label": "受管",
            className: "managed",
          },
          ...(isClustered
            ? [
                {
                  content: <NetworkClusterMemberChip network={network} />,
                  role: "cell",
                  "aria-label": "集群成员",
                },
              ]
            : []),
          {
            content: network.config["ipv4.address"],
            className: "u-align--right",
            role: "cell",
            "aria-label": "IPV4",
          },
          {
            content: network.config["ipv6.address"],
            role: "cell",
            "aria-label": "IPV6",
          },
          {
            content: (
              <div className="table-description" title={network.description}>
                {network.description}
              </div>
            ),
            role: "cell",
            "aria-label": "描述",
          },
          {
            content: (
              <NetworkForwardCount network={network} project={project} />
            ),
            role: "cell",
            className: "u-align--right forwards",
            "aria-label": "转发",
          },
          {
            content: network.used_by?.length ?? "0",
            role: "cell",
            className: "u-align--right used-by",
            "aria-label": "被使用数",
          },
          {
            content: network.status,
            role: "cell",
            "aria-label": "状态",
            className: "state",
          },
        ],
        sortData: {
          name: network.name.toLowerCase(),
          type: network.type,
          managed: network.managed,
          description: network.description?.toLowerCase(),
          state: network.status,
          usedBy: network.used_by?.length ?? 0,
          member: network.memberName,
        },
      };
    });

  if (isLoading || isClusterNetworksLoading) {
    return <Spinner className="u-loader" text="正在加载..." isMainComponent />;
  }

  return (
    <CustomLayout
      mainClassName="network-list"
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
                <HelpLink
                  docPath="/explanation/networks/"
                  title="了解更多网络信息"
                >
                网络
              </HelpLink>
            </PageHeader.Title>
            <PageHeader.Search>
              <NetworkSearchFilter key={searchParams.get("search")} />
            </PageHeader.Search>
          </PageHeader.Left>
          <PageHeader.BaseActions>
            <Button
              appearance="positive"
              className="u-no-margin--bottom"
              onClick={async () =>
                navigate(
                  `/ui/project/${encodeURIComponent(project)}/networks/create`,
                )
              }
              hasIcon={!isSmallScreen}
              disabled={!canCreateNetworks(currentProject)}
              title={
                canCreateNetworks(currentProject)
                  ? ""
                  : "你没有在当前项目中创建网络的权限"
              }
            >
              {!isSmallScreen && <Icon name="plus" light />}
              <span>创建网络</span>
            </Button>
          </PageHeader.BaseActions>
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>
        {hasNetworks && (
          <MainTable
            headers={headers}
            rows={rows}
            paginate={30}
            responsive
            sortable
            className="network-list-table"
            emptyStateMsg="暂无可显示数据"
          />
        )}
        {!isLoading && !hasNetworks && (
          <EmptyState
            className="empty-state"
            image={<Icon className="empty-state-icon" name="exposed" />}
            title="未找到网络"
          >
            <p>当前项目中还没有网络。</p>
            <p>
              <DocLink docPath="/explanation/networks/" hasExternalIcon>
                了解更多网络信息
              </DocLink>
            </p>
          </EmptyState>
        )}
      </Row>
    </CustomLayout>
  );
};

export default NetworkList;
