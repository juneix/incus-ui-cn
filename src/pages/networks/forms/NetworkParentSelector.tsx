import type { FC } from "react";
import { useEffect } from "react";
import {
  Button,
  Icon,
  Label,
  Select,
  Spinner,
  useNotify,
} from "@canonical/react-components";
import { useParams } from "react-router-dom";
import type { FormikProps } from "formik/dist/types";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { ensureEditMode } from "util/instanceEdit";
import { focusField } from "util/formFields";
import type { ClusterSpecificSelectOption } from "components/ClusterSpecificSelect";
import ClusterSpecificSelect from "components/ClusterSpecificSelect";
import { useClusterMembers } from "context/useClusterMembers";
import {
  useNetworks,
  useNetworksFromClusterMembers,
} from "context/useNetworks";
import { macvlanType, sriovType } from "util/networks";

interface Props {
  props?: Record<string, unknown>;
  formik: FormikProps<NetworkFormValues>;
  isClustered: boolean;
}

const NetworkParentSelector: FC<Props> = ({ props, formik, isClustered }) => {
  const { project } = useParams<{ project: string }>();
  const { data: clusterMembers = [] } = useClusterMembers();
  const notify = useNotify();

  if (!project) {
    return <>缺少项目参数</>;
  }

  const networksQueryEnabled = !isClustered;
  const {
    data: networks = [],
    error: networkError,
    isLoading: isNetworkLoading,
  } = useNetworks(project, undefined, networksQueryEnabled);

  useEffect(() => {
    if (networkError) {
      notify.failure("加载网络失败", networkError);
    }
  }, [networkError]);

  const {
    data: networksOnClusterMembers = [],
    error: clusterNetworkError,
    isLoading: isClusterNetworksLoading,
  } = useNetworksFromClusterMembers("default");

  useEffect(() => {
    if (clusterNetworkError) {
      notify.failure("加载集群网络失败", clusterNetworkError);
    }
  }, [clusterNetworkError]);

  const options = networks
    .filter((network) => network.managed === false)
    .map((network) => {
      return {
        label: network.name,
        value: network.name,
      };
    });
  options.unshift({
    label: options.length === 0 ? "无可用网络" : "选择选项",
    value: "",
  });

  if (isNetworkLoading || isClusterNetworksLoading) {
    return <Spinner className="u-loader" text="加载中..." />;
  }

  const getHelpText = () => {
    if (formik.values.networkType === macvlanType) {
      return (
        <>
          用于在其上创建 <code>Macvlan</code> 网卡的父级接口
        </>
      );
    }

    if (formik.values.networkType === sriovType) {
      return (
        <>
          用于在其上创建 <code>SR-IOV</code> 网卡的父级接口
        </>
      );
    }

    return "用于此网络的现有网络接口";
  };

  if (isClustered) {
    const currentValues = Object.values(
      formik.values.parentPerClusterMember ?? {},
    );

    const options: ClusterSpecificSelectOption[] = [];
    clusterMembers.forEach((member) =>
      options.push({
        memberName: member.server_name,
        values: networksOnClusterMembers
          .filter(
            (item) =>
              item.memberName === member.server_name && item.managed === false,
          )
          .map((item) => item.name),
      }),
    );

    return (
      <div className="general-field">
        <div className="general-field-label can-edit">
          <Label forId="parent" required={formik.values.isCreating}>
            父级网络 (Parent)
          </Label>
        </div>
        <div className="general-field-content">
          <ClusterSpecificSelect
            key={JSON.stringify(formik.values.parentPerClusterMember)}
            id="parent"
            options={options}
            values={formik.values.parentPerClusterMember}
            onChange={(value) =>
              void formik.setFieldValue("parentPerClusterMember", value)
            }
            isReadOnly={formik.values.readOnly}
            toggleReadOnly={() => {
              ensureEditMode(formik);
              focusField("parent");
            }}
            isDefaultSpecific={currentValues.some(
              (item) => item !== currentValues[0],
            )}
            disableReason={formik.values.editRestriction}
            helpText={getHelpText()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="general-field">
      <div className="general-field-label can-edit">
        <Label forId="parent" required={formik.values.isCreating}>
          父级网络 (Parent)
        </Label>
      </div>
      <div
        className="general-field-content"
        key={formik.values.readOnly ? "read" : "edit"}
      >
        {formik.values.readOnly ? (
          <>
            {formik.values.parent}
            <Button
              onClick={() => {
                ensureEditMode(formik);
                focusField("parent");
              }}
              className="u-no-margin--bottom"
              type="button"
              appearance="base"
              title={formik.values.editRestriction ?? "编辑"}
              hasIcon
              disabled={!!formik.values.editRestriction}
            >
              <Icon name="edit" />
            </Button>
          </>
        ) : (
          <Select help={getHelpText()} options={options} {...props} />
        )}
      </div>
    </div>
  );
};

export default NetworkParentSelector;
