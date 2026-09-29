import type { FC } from "react";
import { Textarea } from "@canonical/react-components";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import type { ProjectFormValues } from "pages/projects/CreateProject";
import type { FormikProps } from "formik/dist/types";
import { getProjectKey } from "util/projectConfigFields";
import type { LxdConfigPair } from "types/config";

export interface NetworkRestrictionFormValues {
  restricted_network_access?: string;
  restricted_network_subnets?: string;
  restricted_network_uplinks?: string;
  restricted_network_zones?: string;
}

export const networkRestrictionPayload = (
  values: NetworkRestrictionFormValues,
): LxdConfigPair => {
  return {
    [getProjectKey("restricted_network_access")]:
      values.restricted_network_access,
    [getProjectKey("restricted_network_subnets")]:
      values.restricted_network_subnets,
    [getProjectKey("restricted_network_uplinks")]:
      values.restricted_network_uplinks,
    [getProjectKey("restricted_network_zones")]:
      values.restricted_network_zones,
  };
};

interface Props {
  formik: FormikProps<ProjectFormValues>;
}

const NetworkRestrictionForm: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          name: "restricted_network_access",
          label: "可用网络列表",
          defaultValue: "",
          children: <Textarea placeholder="输入网络名称" />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_network_subnets",
          label: "可用网络子网",
          defaultValue: "",
          children: <Textarea placeholder="输入网络子网" />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_network_uplinks",
          label: "可用网络上行链路",
          defaultValue: "",
          children: <Textarea placeholder="输入网络名称" />,
        }),

        getConfigurationRow({
          formik,
          name: "restricted_network_zones",
          label: "可用网络区域",
          defaultValue: "",
          children: <Textarea placeholder="输入网络区域" />,
        }),
      ]}
    />
  );
};

export default NetworkRestrictionForm;
