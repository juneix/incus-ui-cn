import type { FC } from "react";
import { getResourceOptionColumns } from "util/permissions";

interface Props {
  resourceType: string;
}

const columnNames: Record<string, string> = {
  name: "名称",
  project: "项目",
  pool: "存储池",
  description: "描述",
  aliases: "别名",
  fingerprint: "指纹",
  imageType: "镜像类型",
};

const ResourceOptionHeader: FC<Props> = ({ resourceType }) => {
  const columns = getResourceOptionColumns(resourceType);

  if (columns.length < 2) {
    return null;
  }

  const headerSegments = columns.map((column) => {
    return (
      <span key={column} className="resource u-no-margin--bottom">
        {columnNames[column] ?? column}
      </span>
    );
  });

  return <div className="header">{headerSegments}</div>;
};

export default ResourceOptionHeader;
