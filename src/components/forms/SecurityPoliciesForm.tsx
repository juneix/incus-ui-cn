import type { FC } from "react";
import { Input, Select } from "@canonical/react-components";
import type { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import classnames from "classnames";
import {
  optionAllowDeny,
  optionTrueFalse,
  optionYesNo,
} from "util/instanceOptions";
import type {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceField } from "util/instanceConfigFields";
import { optionRenderer } from "util/formFields";

export interface SecurityPoliciesFormValues {
  security_protection_delete?: string;
  security_privileged?: string;
  security_nesting?: string;
  security_protection_shift?: string;
  security_idmap_base?: string;
  security_idmap_size?: number;
  security_idmap_isolated?: string;
  security_devlxd?: string;
  security_devlxd_images?: string;
  security_secureboot?: string;
  security_csm?: string;
}

export const securityPoliciesPayload = (
  values: InstanceAndProfileFormValues,
) => {
  return {
    [getInstanceField("security_protection_delete")]:
      values.security_protection_delete,
    [getInstanceField("security_privileged")]: values.security_privileged,
    [getInstanceField("security_nesting")]: values.security_nesting,
    [getInstanceField("security_protection_shift")]:
      values.security_protection_shift,
    [getInstanceField("security_idmap_base")]: values.security_idmap_base,
    [getInstanceField("security_idmap_size")]:
      values.security_idmap_size?.toString(),
    [getInstanceField("security_idmap_isolated")]:
      values.security_idmap_isolated,
    [getInstanceField("security_devlxd")]: values.security_devlxd,
    [getInstanceField("security_devlxd_images")]: values.security_devlxd_images,
    [getInstanceField("security_secureboot")]: values.security_secureboot,
    [getInstanceField("security_csm")]: values.security_csm,
  };
};

interface Props {
  formik: InstanceAndProfileFormikProps;
}

const SecurityPoliciesForm: FC<Props> = ({ formik }) => {
  const isInstance = formik.values.entityType === "instance";
  const isContainerOnlyDisabled =
    isInstance &&
    (formik.values as CreateInstanceFormValues).instanceType !== "container";
  const isVmOnlyDisabled =
    isInstance &&
    (formik.values as CreateInstanceFormValues).instanceType !==
      "virtual-machine";

  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          label: "删除保护",
          name: "security_protection_delete",
          defaultValue: "",
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: <Select options={optionYesNo} />,
        }),

        getConfigurationRow({
          formik,
          label: "特权模式（仅容器）",
          name: "security_privileged",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled
            ? "仅容器可用"
            : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowDeny),
          children: (
            <Select
              options={optionAllowDeny}
              disabled={isContainerOnlyDisabled}
            />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "嵌套运行（仅容器）",
          name: "security_nesting",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled
            ? "仅容器可用"
            : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionAllowDeny),
          children: (
            <Select
              options={optionAllowDeny}
              disabled={isContainerOnlyDisabled}
            />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "保护 UID/GID 映射位移（仅容器）",
          name: "security_protection_shift",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled
            ? "仅容器可用"
            : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: (
            <Select options={optionYesNo} disabled={isContainerOnlyDisabled} />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "宿主机基础 ID（仅容器）",
          name: "security_idmap_base",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled
            ? "仅容器可用"
            : undefined,
          children: (
            <Input
              placeholder="输入 ID"
              type="text"
              disabled={isContainerOnlyDisabled}
              labelClassName={classnames({
                "is-disabled": isContainerOnlyDisabled,
              })}
            />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "ID 映射大小（仅容器）",
          name: "security_idmap_size",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled
            ? "仅容器可用"
            : undefined,
          children: (
            <Input
              placeholder="输入数字"
              type="number"
              min={0}
              disabled={isContainerOnlyDisabled}
              labelClassName={classnames({
                "is-disabled": isContainerOnlyDisabled,
              })}
            />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "独立 ID 映射（仅容器）",
          name: "security_idmap_isolated",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled
            ? "仅容器可用"
            : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: (
            <Select options={optionYesNo} disabled={isContainerOnlyDisabled} />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "允许实例内访问 /dev/lxd",
          name: "security_devlxd",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled
            ? "仅容器可用"
            : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: (
            <Select options={optionYesNo} disabled={isContainerOnlyDisabled} />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "通过 /dev/lxd 暴露 /1.0/images API（仅容器）",
          name: "security_devlxd_images",
          defaultValue: "",
          disabled: isContainerOnlyDisabled,
          disabledReason: isContainerOnlyDisabled
            ? "仅容器可用"
            : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionYesNo),
          children: (
            <Select options={optionYesNo} disabled={isContainerOnlyDisabled} />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "启用 Secure Boot（仅虚拟机）",
          name: "security_secureboot",
          defaultValue: "",
          disabled: isVmOnlyDisabled,
          disabledReason: isVmOnlyDisabled
            ? "仅虚拟机可用"
            : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionTrueFalse),
          children: (
            <Select options={optionTrueFalse} disabled={isVmOnlyDisabled} />
          ),
        }),

        getConfigurationRow({
          formik,
          label: "启用 CSM（仅虚拟机）",
          name: "security_csm",
          defaultValue: "",
          disabled: isVmOnlyDisabled,
          disabledReason: isVmOnlyDisabled
            ? "仅虚拟机可用"
            : undefined,
          readOnlyRenderer: (val) => optionRenderer(val, optionTrueFalse),
          children: (
            <Select options={optionTrueFalse} disabled={isVmOnlyDisabled} />
          ),
        }),
      ]}
    />
  );
};

export default SecurityPoliciesForm;
