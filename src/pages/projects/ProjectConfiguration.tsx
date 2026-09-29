import type { FC } from "react";
import { useParams } from "react-router-dom";
import EditProject from "pages/projects/EditProject";
import { Spinner } from "@canonical/react-components";
import { useCurrentProject } from "context/useCurrentProject";

const ProjectConfiguration: FC = () => {
  const { project: projectName } = useParams<{ project: string }>();

  if (!projectName) {
    return <>缺少项目参数</>;
  }

  const { project, isLoading } = useCurrentProject();

  if (isLoading) {
    return <Spinner className="u-loader" text="正在加载..." isMainComponent />;
  }

  return project ? (
    <EditProject project={project} key={project.name} />
  ) : (
    <>加载项目失败</>
  );
};

export default ProjectConfiguration;
