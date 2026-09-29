import type { DependencyList, FC } from "react";
import { useState } from "react";
import PermissionGroupsFilter from "../PermissionGroupsFilter";
import type { LxdAuthGroup } from "types/permissions";
import {
  EmptyState,
  Icon,
  ScrollableContainer,
  ScrollableTable,
} from "@canonical/react-components";
import SelectableMainTable from "components/SelectableMainTable";
import { Link } from "react-router-dom";
import { pluralize } from "util/instanceBulkActions";
import useSortTableData from "util/useSortTableData";

interface Props {
  groups: LxdAuthGroup[];
  modifiedGroups: Set<string>;
  parentItemName: string;
  parentItems?: { name: string }[];
  selectedGroups: Set<string>;
  setSelectedGroups: (val: string[], isUnselectAll?: boolean) => void;
  indeterminateGroups?: Set<string>;
  toggleGroup: (rowName: string) => void;
  scrollDependencies: DependencyList;
  preselectedGroups?: Set<string>;
}

const GroupSelection: FC<Props> = ({
  groups,
  modifiedGroups,
  parentItemName,
  parentItems,
  selectedGroups,
  indeterminateGroups,
  setSelectedGroups,
  toggleGroup,
  scrollDependencies,
  preselectedGroups,
}) => {
  const [search, setSearch] = useState("");

  const headers = [
    {
      content: "用户组",
      sortKey: "name",
      className: "name",
    },
    {
      content: "描述",
      sortKey: "description",
      className: "description",
    },
    {
      content: "",
      "aria-label": "修改状态",
      className: "modified-status",
    },
  ];

  const filteredGroups = groups.filter((group) => {
    return group.name.toLowerCase().includes(search) || !search;
  });

  const rows = filteredGroups.map((group) => {
    const groupAdded =
      selectedGroups.has(group.name) && modifiedGroups.has(group.name);
    const groupRemoved =
      !selectedGroups.has(group.name) && modifiedGroups.has(group.name);

    const selectedParentsText =
      (parentItems?.length || 0) > 1
        ? `所有已选${pluralize(parentItemName, 2)}`
        : `${parentItemName} ${parentItems?.[0]?.name}`;
    const modifiedTitle = groupAdded
      ? `该用户组将添加到${selectedParentsText}`
      : groupRemoved
        ? `该用户组将从${selectedParentsText}中移除`
        : "";

    const toggleRow = () => {
      toggleGroup(group.name);
    };

    return {
      key: group.name,
      name: group.name,
      className: "u-row",
      columns: [
        {
          content: group.name,
          title: group.name,
          onClick: toggleRow,
          role: "rowheader",
          className: "name u-truncate clickable-cell",
          "aria-label": "名称",
        },
        {
          content: <span>{group.description || ""}</span>,
          onClick: toggleRow,
          role: "cell",
          className: "description clickable-cell",
          "aria-label": "描述",
          title: group.description,
        },
        {
          content: modifiedGroups.has(group.name) && (
            <Icon name="status-in-progress-small" />
          ),
          role: "cell",
          "aria-label": "修改状态",
          className: "modified-status u-align--right",
          title: parentItemName ? modifiedTitle : undefined,
        },
      ],
      sortData: {
        name: group.name.toLowerCase(),
        description: group.description.toLowerCase(),
        isPreselected: preselectedGroups?.has(group.name),
      },
    };
  });

  const { rows: sortedRows } = useSortTableData({
    rows,
    defaultSort: preselectedGroups ? "isPreselected" : "name",
    defaultSortDirection: preselectedGroups ? "descending" : "ascending",
  });

  return (
    <ScrollableContainer
      dependencies={scrollDependencies}
      belowIds={["panel-footer"]}
      className="group-selection"
    >
      <PermissionGroupsFilter onChange={setSearch} value={search} />
      {groups.length ? (
        <ScrollableTable
          dependencies={[...scrollDependencies, search]}
          tableId="group-selection-table"
          belowIds={["panel-footer"]}
        >
          <SelectableMainTable
            id="group-selection-table"
            className="group-selection-table"
            headers={headers}
            rows={sortedRows}
            sortable
            emptyStateMsg="未找到用户组"
            itemName="用户组"
            parentName=""
            selectedNames={Array.from(selectedGroups)}
            setSelectedNames={setSelectedGroups}
            disabledNames={[]}
            filteredNames={groups.map((group) => group.name)}
            indeterminateNames={Array.from(indeterminateGroups ?? new Set())}
            onToggleRow={toggleGroup}
            hideContextualMenu
          />
        </ScrollableTable>
      ) : (
        <EmptyState
          className="empty-state empty-state__full-width"
          image={<Icon name="user-group" className="empty-state-icon" />}
          title="未找到用户组"
        >
          <p>
            用户组可以帮助你更方便地统一管理权限分配。
          </p>
          <Link to={`/ui/permissions/groups?panel=create-groups`}>
            创建用户组
            <Icon className="external-link-icon" name="external-link" />
          </Link>
        </EmptyState>
      )}
    </ScrollableContainer>
  );
};

export default GroupSelection;
