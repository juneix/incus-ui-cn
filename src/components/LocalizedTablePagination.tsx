import type { HTMLAttributes, PropsWithChildren, ReactElement, ReactNode } from "react";
import { Children, cloneElement, useEffect, useMemo, useState } from "react";
import { Button, Icon, Input, Select } from "@canonical/react-components";
import classnames from "classnames";

interface Props extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  data: unknown[];
  dataForwardProp?: string;
  itemName?: string;
  className?: string;
  description?: ReactNode;
  pageLimits?: number[];
  position?: "above" | "below";
}

const DEFAULT_PAGE_LIMITS = [50, 100, 200];

const renderChildren = (
  children: ReactNode,
  dataForwardProp: string,
  data: unknown[],
) => {
  return Children.map(children, (child) => {
    return cloneElement(child as ReactElement, {
      [dataForwardProp]: data,
    });
  });
};

const LocalizedTablePagination = ({
  data,
  dataForwardProp = "rows",
  itemName = "项目",
  className,
  description,
  pageLimits = DEFAULT_PAGE_LIMITS,
  position = "above",
  children,
  ...divProps
}: Props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageLimits[0] ?? 50);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const paginationDescription =
    description ?? (
      <>
        共 <b>{totalItems}</b> 个{itemName}
      </>
    );

  const controls = (
    <div
      className={classnames("pagination", className)}
      role="navigation"
      {...divProps}
    >
      <div className="description" id="pagination-description">
        {paginationDescription}
      </div>
      <Button
        aria-label="上一页"
        className="back"
        appearance="base"
        hasIcon
        disabled={currentPage <= 1}
        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
      >
        <Icon name="chevron-down" />
      </Button>
      <Input
        id="paginationPageInput"
        label="页码"
        labelClassName="u-off-screen"
        className="u-no-margin--bottom pagination-input"
        onChange={(e) => {
          const nextPage = Number(e.target.value);
          if (Number.isNaN(nextPage)) {
            return;
          }
          setCurrentPage(Math.min(totalPages, Math.max(1, nextPage)));
        }}
        value={currentPage}
        type="number"
        disabled={totalPages <= 1}
        min={1}
        max={totalPages}
      />
      <div className="pagination-item-count">共&nbsp;{totalPages}&nbsp;页</div>
      <Button
        aria-label="下一页"
        className="next"
        appearance="base"
        hasIcon
        disabled={currentPage >= totalPages}
        onClick={() =>
          setCurrentPage((page) => Math.min(totalPages, page + 1))
        }
      >
        <Icon name="chevron-down" />
      </Button>
      <Select
        className="u-no-margin--bottom"
        label="每页数量"
        labelClassName="u-off-screen"
        id="itemsPerPage"
        options={pageLimits.map((limit) => ({
          value: limit,
          label: `每页 ${limit} 个`,
        }))}
        onChange={(e) => {
          setCurrentPage(1);
          setPageSize(Number(e.target.value));
        }}
        value={pageSize}
      />
    </div>
  );

  const clonedChildren = renderChildren(children, dataForwardProp, pageData);

  return (
    <>
      {position === "above" && controls}
      {clonedChildren}
      {position === "below" && controls}
    </>
  );
};

export default LocalizedTablePagination;
