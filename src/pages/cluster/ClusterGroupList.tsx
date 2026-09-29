import type { FC } from "react";
import {
  Button,
  List,
  MainTable,
  Row,
  ScrollableTable,
  TablePagination,
  useNotify,
  Spinner,
} from "@canonical/react-components";
import EditClusterGroupBtn from "pages/cluster/actions/EditClusterGroupBtn";
import DeleteClusterGroupBtn from "pages/cluster/actions/DeleteClusterGroupBtn";
import NotificationRow from "components/NotificationRow";
import BaseLayout from "components/BaseLayout";
import HelpLink from "components/HelpLink";
import useSortTableData from "util/useSortTableData";
import CreateClusterGroupBtn from "pages/cluster/actions/CreateClusterGroupBtn";
import ResourceLink from "components/ResourceLink";
import { useClusterGroups } from "context/useClusterGroups";
import usePanelParams from "util/usePanelParams";
import { useServerEntitlements } from "util/entitlements/server";

const ClusterGroupList: FC = () => {
  const notify = useNotify();
  const panelParams = usePanelParams();
  const { data: groups = [], error, isLoading } = useClusterGroups();
  const { canEditServerConfiguration } = useServerEntitlements();

  if (error) {
    notify.failure("加载集群分组失败", error);
  }

  const headers = [
    {
      content: "集群分组",
      className: "name",
      sortKey: "name",
    },
    {
      content: "描述",
      className: "description",
      sortKey: "description",
    },
    {
      content: "被使用于",
    },
    {
      content: "成员数",
      className: "members u-align--right",
      sortKey: "members",
    },
    {
      "aria-label": "操作",
      className: "u-align--right actions",
    },
  ];

  const rows = groups.map((group) => {
    const usedBy = group?.used_by ?? [];
    const openGroupEdit = () => {
      panelParams.openEditClusterGroup(group.name);
    };

    return {
      key: group.name,
      name: group.name,
      columns: [
        {
          content: group.name,
          className: "name",
        },
        {
          content: group.description || "-",
          className: "description",
        },
        {
          content:
            usedBy.length > 0
              ? usedBy.map((resource) => {
                  if (resource.startsWith("/1.0/projects/")) {
                    const project = resource.replace("/1.0/projects/", "");
                    return (
                      <ResourceLink
                        type="project"
                        value={project}
                        to={`/ui/project/${encodeURIComponent(project)}/configuration/clusters`}
                        key={resource}
                      />
                    );
                  }
                  return resource;
                })
              : "-",
        },
        {
          content: canEditServerConfiguration() ? (
            <Button appearance="link" dense onClick={openGroupEdit}>
              {group.members.length}
            </Button>
          ) : (
            group.members.length
          ),
          className: "members u-align--right",
        },
        {
          content: (
            <List
              inline
              className="actions-list u-no-margin--bottom"
              items={[
                <EditClusterGroupBtn group={group.name} key="edit" />,
                <DeleteClusterGroupBtn group={group.name} key="delete" />,
              ]}
            />
          ),
          className: "u-align--right actions",
        },
      ],
      sortData: {
        name: group.name.toLowerCase(),
        description: group.description.toLowerCase(),
        members: group.members.length,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  return (
    <BaseLayout
      mainClassName="cluster-list"
      title={
        <HelpLink
          docPath="/explanation/clustering/#cluster-groups"
          title="了解更多集群分组"
        >
          集群分组
        </HelpLink>
      }
      controls={<CreateClusterGroupBtn />}
    >
      <NotificationRow />
      <Row>
        <ScrollableTable
          dependencies={[groups, notify.notification]}
          tableId="cluster-table"
          belowIds={["status-bar"]}
        >
          <TablePagination
            data={sortedRows}
            id="pagination"
            itemName="集群分组"
            className="u-no-margin--top"
            aria-label="表格分页控件"
          >
            <MainTable
              id="cluster-table"
              headers={headers}
              sortable
              responsive
              onUpdateSort={updateSort}
              emptyStateMsg={
                isLoading && (
                  <Spinner
                    className="u-loader"
                    text="正在加载集群分组..."
                  />
                )
              }
            />
          </TablePagination>
        </ScrollableTable>
      </Row>
    </BaseLayout>
  );
};

export default ClusterGroupList;
