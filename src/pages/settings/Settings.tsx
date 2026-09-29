import type { FC } from "react";
import { useState } from "react";
import {
  MainTable,
  Notification,
  Row,
  ScrollableTable,
  SearchBox,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import SettingForm from "./SettingForm";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import { queryKeys } from "util/queryKeys";
import { fetchConfigOptions } from "api/server";
import { useQuery } from "@tanstack/react-query";
import type { ConfigField } from "types/config";
import ConfigFieldDescription from "pages/settings/ConfigFieldDescription";
import { toConfigFields } from "util/config";
import PageHeader from "components/PageHeader";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useServerEntitlements } from "util/entitlements/server";
import type { ClusterSpecificValues } from "components/ClusterSpecificSelect";
import { useClusteredSettings } from "context/useSettings";
import type { LXDSettingOnClusterMember } from "types/server";
import { useProjects } from "context/useProjects";
import { getDefaultProject } from "util/loginProject";

const Settings: FC = () => {
  const [query, setQuery] = useState("");
  const notify = useNotify();
  const {
    hasMetadataConfiguration,
    settings,
    isSettingsLoading,
    settingsError,
  } = useSupportedFeatures();
  const { canEditServerConfiguration } = useServerEntitlements();

  const { data: configOptions, isLoading: isConfigOptionsLoading } = useQuery({
    queryKey: [queryKeys.configOptions],
    queryFn: async () => fetchConfigOptions(hasMetadataConfiguration),
  });
  const { data: clusteredSettings = [], error: clusterError } =
    useClusteredSettings();

  const { data: projects = [] } = useProjects();

  if (clusterError) {
    notify.failure("加载集群设置失败", clusterError);
  }

  if (isConfigOptionsLoading || isSettingsLoading) {
    return <Spinner className="u-loader" text="正在加载..." isMainComponent />;
  }

  if (settingsError) {
    notify.failure("加载设置失败", settingsError);
  }

  const getValue = (configField: ConfigField): string | undefined => {
    for (const [key, value] of Object.entries(settings?.config ?? {})) {
      if (key === configField.key) {
        return value;
      }
    }
    if (configField.type === "bool") {
      return configField.default === "true" ? "true" : "false";
    }
    if (configField.default === "-") {
      return undefined;
    }
    return configField.default;
  };

  const getClusteredValue = (
    clusteredSettings: LXDSettingOnClusterMember[],
    configField: ConfigField,
  ): ClusterSpecificValues => {
    const settingPerClusterMember: ClusterSpecificValues = {};

    clusteredSettings?.forEach((item) => {
      settingPerClusterMember[item.memberName] =
        item.config?.[configField.key] ?? configField.default ?? "";
    });

    return settingPerClusterMember;
  };

  const headers = [
    { content: "分组", className: "group" },
    { content: "键", className: "key" },
    { content: "值" },
  ];

  const configFields = toConfigFields(configOptions?.configs?.server ?? {});

  configFields.push({
    key: "user.ui_grafana_base_url",
    category: "user",
    default: "",
    longdesc:
      "e.g. https://example.org/dashboard?project={project}&name={instance}\n or https://192.0.2.1:3000/d/bGY-LSB7k/lxd?orgId=1",
    shortdesc:
      "LXD will replace `{instance}` and `{project}` with project and instance names for deep-linking to individual grafana pages.\nSee {ref}`grafana` for more information.",
    type: "string",
  });

  configFields.push({
    key: "user.ui.sso_only",
    category: "user",
    default: "false",
    shortdesc: "是否仅允许使用 SSO/OIDC 登录。",
    type: "bool",
  });

  configFields.push({
    key: "user.ui_login_project",
    category: "user",
    default: getDefaultProject(projects),
    shortdesc: "登录后默认显示的项目。",
    type: "string",
  });

  configFields.push({
    key: "user.ui_theme",
    category: "user",
    default: "",
    shortdesc: "设置界面为深色、浅色，或跟随系统主题。",
    type: "string",
  });

  configFields.push({
    key: "user.ui.title",
    category: "user",
    default: "",
    shortdesc: "LXD-UI 网页标题。未设置时显示主机名。",
    type: "string",
  });

  let lastCategory = "";
  const rows = configFields
    .filter((configField) => {
      if (!query) {
        return true;
      }
      return (
        configField.key.toLowerCase().includes(query.toLowerCase()) ||
        configField.shortdesc?.toLowerCase().includes(query.toLowerCase())
      );
    })
    .map((configField, index, { length }) => {
      const isDefault = !Object.keys(settings?.config ?? {}).some(
        (key) => key === configField.key,
      );
      const value = getValue(configField);

      const clusteredValue = getClusteredValue(clusteredSettings, configField);

      const isNewCategory = lastCategory !== configField.category;
      lastCategory = configField.category;

      return {
        key: configField.key,
        columns: [
          {
            content: isNewCategory && (
              <h2 className="p-heading--5">{configField.category}</h2>
            ),
            role: "rowheader",
            className: "group",
            "aria-label": "分组",
          },
          {
            content: (
              <div className="key-cell">
                {isDefault ? (
                  configField.key
                ) : (
                  <strong>{configField.key}</strong>
                )}
                <p className="p-text--small u-text--muted u-no-margin--bottom">
                  <ConfigFieldDescription description={configField.shortdesc} />
                </p>
              </div>
            ),
            role: "cell",
            className: "key",
            "aria-label": "键",
          },
          {
            content: (
              <SettingForm
                configField={configField}
                value={value}
                clusteredValue={clusteredValue}
                isLast={index === length - 1}
              />
            ),
            role: "cell",
            "aria-label": "值",
            className: "u-vertical-align-middle",
          },
        ],
      };
    });

  return (
    <>
      <CustomLayout
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink
                  docPath="/server/"
                  title="了解更多服务器配置"
                >
                  设置
                </HelpLink>
              </PageHeader.Title>
              <PageHeader.Search>
                <SearchBox
                  name="search-setting"
                  type="text"
                  className="u-no-margin--bottom"
                  onChange={(value) => {
                    setQuery(value);
                  }}
                  placeholder="搜索"
                  value={query}
                />
              </PageHeader.Search>
            </PageHeader.Left>
          </PageHeader>
        }
        contentClassName="settings"
      >
        <NotificationRow />
        <Row>
          {!canEditServerConfiguration() && (
            <Notification
              severity="caution"
              title="权限受限"
              titleElement="h2"
            >
              你没有权限查看或编辑服务器设置
            </Notification>
          )}
          {!hasMetadataConfiguration && canEditServerConfiguration() && (
            <Notification
              severity="information"
              title="获取更多服务器设置"
              titleElement="h2"
            >
              升级到 LXD v5.19.0 或更高版本以访问更多服务器设置
            </Notification>
          )}
          {canEditServerConfiguration() && (
            <ScrollableTable
              dependencies={[notify.notification, rows]}
              tableId="settings-table"
              belowIds={["status-bar"]}
            >
              <MainTable
                id="settings-table"
                headers={headers}
                rows={rows}
                emptyStateMsg="暂无数据"
              />
            </ScrollableTable>
          )}
        </Row>
      </CustomLayout>
    </>
  );
};

export default Settings;
