import type { FC } from "react";
import { CustomSelect } from "@canonical/react-components";
import type {
  CustomSelectOption,
  CustomSelectProps,
} from "@canonical/react-components";
import { getNetworkAcls } from "util/networks";
import type { LxdNetwork } from "types/network";

interface Props {
  value: string;
  setValue: (value: string) => void;
  filteredNetworks: LxdNetwork[];
  hasNoneOption?: boolean;
}

const NetworkSelector: FC<
  Props & Omit<CustomSelectProps, "onChange" | "options" | "value">
> = ({
  value,
  setValue,
  filteredNetworks,
  hasNoneOption = false,
  ...selectProps
}) => {
  const getNetworkOptions = () => {
    const options: CustomSelectOption[] = filteredNetworks.map((network) => {
      return {
        label: (
          <div className="label">
            <span title={network.name} className="network-option u-truncate">
              {network.name}
            </span>
            <span title={network.type} className="network-option u-truncate">
              {network.type}
            </span>
            <span
              title="network ACLs"
              className="network-option u-truncate u-align--right"
            >
              {getNetworkAcls(network).length || "-"}
            </span>
          </div>
        ),
        value: network.name,
        text: `${network.name} - ${network.type}`,
        disabled: false,
        selectedLabel: (
          <span>
            {network.name}&nbsp;
            <span className="u-text--muted">&#40;{network.type}&#41;</span>
          </span>
        ),
      };
    });

    if (options.length === 0) {
      options.unshift({
        label: <span>无可用网络</span>,
        value: "",
        text: "无",
        disabled: true,
      });
    }

    if (hasNoneOption) {
      options.push({
        label: (
          <div className="label">
            <span title="不使用网络" className="network-option u-truncate">
              不使用网络
            </span>
            <span title="无网络类型" className="network-option u-truncate">
              -
            </span>
            <span
              title="网络 ACL"
              className="network-option u-truncate u-align--right"
            >
              -
            </span>
          </div>
        ),
        value: "none",
        text: "不使用网络",
        disabled: false,
      });
    }

    return options;
  };

  const getHeader = () => {
    return (
      <div className="header">
        <span className="network-option u-no-margin--bottom">名称</span>
        <span className="network-option u-no-margin--bottom">类型</span>
        <span className="network-option u-no-margin--bottom u-align--right">
          ACL
        </span>
      </div>
    );
  };

  return (
    <CustomSelect
      label="网络"
      {...selectProps}
      onChange={(e) => {
        setValue(e);
      }}
      value={value}
      options={getNetworkOptions()}
      header={getHeader()}
      dropdownClassName="network-select-dropdown"
      aria-label="网络"
    />
  );
};

export default NetworkSelector;
