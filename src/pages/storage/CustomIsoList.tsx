import type { FC } from "react";
import { useState } from "react";
import {
  EmptyState,
  Icon,
  List,
  MainTable,
  Row,
  ScrollableTable,
  SearchBox,
  TablePagination,
  useToastNotification,
  CustomLayout,
  Spinner,
} from "@canonical/react-components";
import { humanFileSize, isoTimeToString } from "util/helpers";
import DeleteStorageVolumeBtn from "pages/storage/actions/DeleteStorageVolumeBtn";
import CreateInstanceFromImageBtn from "pages/images/actions/CreateInstanceFromImageBtn";
import UploadCustomIsoBtn from "pages/images/actions/UploadCustomIsoBtn";
import { Link, useParams } from "react-router-dom";
import useSortTableData from "util/useSortTableData";
import PageHeader from "components/PageHeader";
import HelpLink from "components/HelpLink";
import NotificationRow from "components/NotificationRow";
import ResourceLabel from "components/ResourceLabel";
import { useLoadIsoVolumes } from "context/useVolumes";
import DocLink from "components/DocLink";

const CustomIsoList: FC = () => {
  const toastNotify = useToastNotification();
  const [query, setQuery] = useState<string>("");
  const { project } = useParams<{
    project: string;
  }>();

  if (!project) {
    return <>缺少项目参数</>;
  }

  const { data: images = [], isLoading } = useLoadIsoVolumes(project);

  const headers = [
    { content: "名称", sortKey: "name" },
    { content: "存储池", sortKey: "storagePool", className: "pool" },
    { content: "上传时间", sortKey: "uploadedAt", className: "uploaded_at" },
    { content: "大小", sortKey: "size", className: "u-align--right size" },
    {
      content: "使用中",
      sortKey: "usedBy",
      className: "u-align--right used_by",
    },
    { "aria-label": "操作", className: "actions" },
  ];

  const filteredImages = images.filter(
    (item) =>
      !query || item.aliases.toLowerCase().includes(query.toLowerCase()),
  );

  const rows = filteredImages.map((image) => {
    const actions = image.volume && (
      <List
        inline
        className="actions-list u-no-margin--bottom"
        items={[
          <CreateInstanceFromImageBtn
            key="launch"
            projectName={project}
            image={image}
          />,
          <DeleteStorageVolumeBtn
            key="delete"
            volume={image.volume}
            project={project}
            onFinish={() =>
              toastNotify.success(
                <>
                  自定义 ISO{" "}
                  <ResourceLabel bold type="iso-volume" value={image.aliases} />{" "}
                  已删除。
                </>,
              )
            }
          />,
        ]}
      />
    );

    return {
      key: image.fingerprint,
      columns: [
        {
          content: image.aliases,
          role: "rowheader",
          "aria-label": "名称",
        },
        {
          content: (
            <div className="u-truncate" title={image.pool}>
              <Link
                to={`/ui/project/${encodeURIComponent(project)}/storage/pool/${encodeURIComponent(image.pool ?? "")}`}
              >
                {image.pool}
              </Link>
            </div>
          ),
          role: "cell",
          "aria-label": "存储池",
          className: "pool",
        },
        {
          content: isoTimeToString(new Date(image.created_at).toISOString()),
          role: "cell",
          "aria-label": "上传时间",
          className: "uploaded_at",
        },
        {
          content:
            image.volume?.config.size &&
            humanFileSize(+image.volume.config.size),
          role: "cell",
          "aria-label": "大小",
          className: "u-align--right size",
        },
        {
          content: image.volume?.used_by?.length ?? 0,
          role: "cell",
          "aria-label": "使用中",
          className: "u-align--right used_by",
        },
        {
          content: actions,
          role: "cell",
          "aria-label": "操作",
          className: "u-align--right actions",
        },
      ],
      sortData: {
        name: image.aliases.toLowerCase(),
        storagePool: image.pool?.toLowerCase(),
        size: +(image.volume?.config.size ?? 0),
        uploadedAt: image.created_at,
        usedBy: image.volume?.used_by?.length ?? 0,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  if (isLoading) {
    return <Spinner className="u-loader" text="加载中..." isMainComponent />;
  }

  const hasImages = images.length !== 0;

  const content = !hasImages ? (
    <EmptyState
      className="empty-state"
      image={<Icon name="iso" className="empty-state-icon" />}
      title="当前项目中未找到自定义 ISO"
    >
      <p>上传的自定义 ISO 将显示在此处</p>
      <p>
        <DocLink
          docPath="/howto/instances_create/#instances-create-iso"
          hasExternalIcon
        >
          了解如何创建从 ISO 启动的虚拟机
        </DocLink>
      </p>
      <UploadCustomIsoBtn
        className="empty-state-button"
        projectName={project}
      />
    </EmptyState>
  ) : (
    <div className="custom-iso-list">
      <ScrollableTable
        dependencies={[images]}
        tableId="custom-iso-table"
        belowIds={["status-bar"]}
      >
        <TablePagination
          data={sortedRows}
          id="pagination"
          itemName="个自定义 ISO"
          className="u-no-margin--top"
          aria-label="表格分页控件"
        >
          <MainTable
            id="custom-iso-table"
            headers={headers}
            sortable
            className="custom-iso-table"
            onUpdateSort={updateSort}
            emptyStateMsg="未找到匹配的自定义 ISO"
          />
        </TablePagination>
      </ScrollableTable>
    </div>
  );

  return (
    <CustomLayout
      mainClassName="custom-iso-list"
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink
                docPath="/howto/instances_create/#instances-create-iso"
                title="了解如何创建从 ISO 启动的虚拟机"
              >
                自定义 ISO
              </HelpLink>
            </PageHeader.Title>
            {hasImages && (
              <PageHeader.Search>
                <div className="search-box-wrapper">
                  <SearchBox
                    name="search-snapshot"
                    className="search-box margin-right u-no-margin--bottom"
                    type="text"
                    onChange={(value) => {
                      setQuery(value);
                    }}
                    placeholder="搜索自定义 ISO"
                    value={query}
                    aria-label="搜索自定义 ISO"
                  />
                </div>
              </PageHeader.Search>
            )}
          </PageHeader.Left>
          {hasImages && (
            <PageHeader.BaseActions>
              <UploadCustomIsoBtn
                className="u-float-right u-no-margin--bottom"
                projectName={project}
              />
            </PageHeader.BaseActions>
          )}
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>{content}</Row>
    </CustomLayout>
  );
};

export default CustomIsoList;
