import type { FC } from "react";
import {
  MainTable,
  ScrollableTable,
  Spinner,
  TablePagination,
  useNotify,
} from "@canonical/react-components";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchOSServices } from "api/os";
import NotificationRow from "components/NotificationRow";
import { nameFromURL } from "util/os";
import { queryKeys } from "util/queryKeys";
import useSortTableData from "util/useSortTableData";

interface Props {
  target: string;
}

const OSServices: FC<Props> = ({ target }) => {
  const notify = useNotify();

  const {
    data: services,
    isLoading,
    error,
  } = useQuery({
    queryKey: [queryKeys.osServices, target],
    queryFn: async () => fetchOSServices(target),
  });

  const headers = [
    {
      content: "名称",
      className: "name",
    },
  ];

  const rows =
    services?.map((service) => {
      const serviceName = nameFromURL(service);

      return {
        key: serviceName,
        className: "u-row",
        name: serviceName,
        columns: [
          {
            content: (
              <>
                <div className="u-truncate" title={`${serviceName}`}>
                  <Link
                    to={`/ui/os/services/${serviceName}`}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {serviceName}
                  </Link>
                </div>
              </>
            ),
            role: "rowheader",
            "aria-label": "名称",
            className: "name",
          },
        ],
        sortData: {
          name: serviceName?.toLowerCase(),
        },
      };
    }) ?? [];

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  if (error) {
    notify.failure("加载服务列表失败", error);
  }

  return (
    <div>
      <NotificationRow />
      {isLoading && <Spinner className="u-loader" text="正在加载服务..." />}
      {!isLoading && !error && services?.length > 0 && (
        <>
          <ScrollableTable
            dependencies={[services, notify.notification]}
            tableId="incusos-services-table"
            belowIds={["status-bar"]}
          >
            <TablePagination
              data={sortedRows}
              id="pagination"
              itemName="个服务"
              className="u-no-margin--top"
              aria-label="表格分页控件"
            >
              <MainTable
                id="incusos-services-table"
                headers={headers}
                sortable
                emptyStateMsg="未找到匹配的服务"
                onUpdateSort={updateSort}
              />
            </TablePagination>
          </ScrollableTable>
        </>
      )}
    </div>
  );
};

export default OSServices;
