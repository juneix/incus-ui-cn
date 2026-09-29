import type { FC } from "react";
import { Row, Col, CustomLayout } from "@canonical/react-components";

const NoMatch: FC = () => {
  return (
    <CustomLayout mainClassName="no-match">
      <Row>
        <Col size={6} className="col-start-large-4">
          <h1 className="p-heading--4">404 页面未找到</h1>
          <p>
            抱歉，无法找到您请求的页面。
            <br />
            如果您认为这是系统错误，请{" "}
            <a
              href="https://github.com/zabbly/lxd-ui-canonical/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              title="提交问题反馈"
            >
              提交反馈
            </a>
            。
          </p>
        </Col>
      </Row>
    </CustomLayout>
  );
};

export default NoMatch;
