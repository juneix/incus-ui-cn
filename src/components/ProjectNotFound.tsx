import type { FC } from "react";
import { Row, Col, CustomLayout } from "@canonical/react-components";

const ProjectNotFound: FC = () => {
  const url = location.pathname;
  const hasProjectInUrl = url.startsWith("/ui/project/");
  const project = hasProjectInUrl ? url.split("/")[3] : "default";

  return (
    <CustomLayout mainClassName="no-match">
      <Row>
        <Col size={6} className="col-start-large-4">
          <h1 className="p-heading--4">项目未找到</h1>
          <p>
            项目 <code>{project}</code> 不存在或您没有访问权限。
          </p>
        </Col>
      </Row>
    </CustomLayout>
  );
};

export default ProjectNotFound;
