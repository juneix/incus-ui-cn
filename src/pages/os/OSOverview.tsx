import type { FC } from "react";
import { Col, Row, useNotify, Spinner } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import {
  fetchOS,
  fetchOSApplication,
  fetchOSApplications,
  fetchSystemUpdate,
} from "api/os";
import NotificationRow from "components/NotificationRow";
import { nameFromURL } from "util/os";
import { queryKeys } from "util/queryKeys";

interface Props {
  target: string;
}

const OSOverview: FC<Props> = ({ target }) => {
  const notify = useNotify();
  const {
    data: incusOSData,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.os, target],
    queryFn: async () => fetchOS(target),
  });

  const { data: systemUpdate } = useQuery({
    queryKey: [queryKeys.osUpdate, target],
    queryFn: async () => fetchSystemUpdate(target),
  });

  const { data: appUrls } = useQuery({
    queryKey: [queryKeys.osApps, target],
    queryFn: async () => fetchOSApplications(target),
  });

  const apps = useQuery({
    queryKey: [queryKeys.osApps, "details", target],
    queryFn: async () => {
      return Promise.all(
        appUrls.map(async (url: string) => {
          const res = await fetchOSApplication(url, target);
          return { name: nameFromURL(url), data: res };
        }),
      );
    },
    enabled: !!appUrls,
  });

  if (isLoading) {
    return <Spinner className="u-loader" text="正在加载操作系统概览..." />;
  }

  if (error) {
    notify.failure("加载概览失败", error);
  }

  return (
    <div className="incusos-overview-tab">
      <NotificationRow />
      <Row className="general">
        <Col size={3}>
          <h2 className="p-heading--5">常规</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr>
                <th className="u-text--muted">版本</th>
                <td>{incusOSData.environment.os_version}</td>
              </tr>
              <tr>
                <th className="u-text--muted">更新状态</th>
                <td>{systemUpdate?.state?.status}</td>
              </tr>
              <tr>
                <th className="u-text--muted">已安装应用</th>
                <td>
                  {apps.data?.map((app) => (
                    <div key={app.name}>
                      {app.name} {app.data?.state?.version}
                    </div>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
    </div>
  );
};

export default OSOverview;
