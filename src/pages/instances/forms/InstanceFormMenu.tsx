import type { FC } from "react";
import { useEffect, useState } from "react";
import MenuItem from "components/forms/FormMenuItem";
import { Button, useListener, useNotify } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import { useSupportedFeatures } from "context/useSupportedFeatures";

export const MAIN_CONFIGURATION = "基础配置";
export const DISK_DEVICES = "磁盘";
export const NETWORK_DEVICES = "网络";
export const GPU_DEVICES = "GPU";
export const PROXY_DEVICES = "代理";
export const OTHER_DEVICES = "其他";
export const RESOURCE_LIMITS = "资源限制";
export const SECURITY_POLICIES = "安全策略";
export const MIGRATION = "迁移";
export const SNAPSHOTS = "快照";
export const BOOT = "启动";
export const CLOUD_INIT = "Cloud-init";
export const USER_PROPERTIES = "用户属性";
export const YAML_CONFIGURATION = "YAML 配置";

interface Props {
  isDisabled: boolean;
  active: string;
  setActive: (val: string) => void;
  hasDiskError: boolean;
  hasNetworkError: boolean;
}

const InstanceFormMenu: FC<Props> = ({
  isDisabled,
  active,
  setActive,
  hasDiskError,
  hasNetworkError,
}) => {
  const notify = useNotify();
  const [isDeviceExpanded, setDeviceExpanded] = useState(true);
  const { hasMetadataConfiguration } = useSupportedFeatures();

  const disableReason = isDisabled
    ? "请先选择镜像，再添加自定义配置"
    : undefined;

  const menuItemProps = {
    active,
    setActive,
    disableReason,
  };

  const resize = () => {
    updateMaxHeight("form-navigation", "p-bottom-controls");
  };
  useEffect(resize, [notify.notification?.message]);
  useListener(window, resize, "resize", true);

  return (
    <div className="p-side-navigation--accordion form-navigation">
      <nav aria-label="实例表单导航">
        <ul className="p-side-navigation__list">
          <MenuItem label={MAIN_CONFIGURATION} {...menuItemProps} />
          <li className="p-side-navigation__item">
            <Button
              type="button"
              className="p-side-navigation__accordion-button"
              aria-expanded={isDeviceExpanded ? "true" : "false"}
              onClick={() => {
                if (!isDisabled) {
                  setDeviceExpanded(!isDeviceExpanded);
                }
              }}
              disabled={isDisabled}
              title={disableReason}
            >
              设备
            </Button>
            <ul
              className="p-side-navigation__list"
              aria-expanded={isDeviceExpanded ? "true" : "false"}
            >
              <MenuItem
                label={DISK_DEVICES}
                hasError={hasDiskError}
                {...menuItemProps}
              />
              <MenuItem
                label={NETWORK_DEVICES}
                hasError={hasNetworkError}
                {...menuItemProps}
              />
              <MenuItem label={GPU_DEVICES} {...menuItemProps} />
              <MenuItem label={PROXY_DEVICES} {...menuItemProps} />
              {hasMetadataConfiguration && (
                <MenuItem label={OTHER_DEVICES} {...menuItemProps} />
              )}
            </ul>
          </li>
          <MenuItem label={RESOURCE_LIMITS} {...menuItemProps} />
          <MenuItem label={SECURITY_POLICIES} {...menuItemProps} />
          <MenuItem label={SNAPSHOTS} {...menuItemProps} />
          <MenuItem label={MIGRATION} {...menuItemProps} />
          <MenuItem label={BOOT} {...menuItemProps} />
          <MenuItem label={CLOUD_INIT} {...menuItemProps} />
          <MenuItem label={USER_PROPERTIES} {...menuItemProps} />
        </ul>
      </nav>
    </div>
  );
};

export default InstanceFormMenu;
