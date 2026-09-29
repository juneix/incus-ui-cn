import type { FC } from "react";
import { Input } from "@canonical/react-components";
import { getConfigurationRow } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import type { ProjectFormValues } from "pages/projects/CreateProject";
import type { FormikProps } from "formik/dist/types";
import DiskSizeSelector from "components/forms/DiskSizeSelector";
import { getProjectKey } from "util/projectConfigFields";
import type { LxdConfigPair } from "types/config";
import CpuLimitInput from "components/forms/CpuLimitInput";
import MemoryLimitAvailable from "components/forms/MemoryLimitAvailable";

export interface ProjectResourceLimitsFormValues {
  limits_instances?: number;
  limits_containers?: number;
  limits_virtual_machines?: number;
  limits_disk?: string;
  limits_networks?: number;
  limits_cpu?: number;
  limits_memory?: string;
  limits_processes?: number;
}

export const resourceLimitsPayload = (
  values: ProjectFormValues,
): LxdConfigPair => {
  return {
    [getProjectKey("limits_instances")]: values.limits_instances?.toString(),
    [getProjectKey("limits_containers")]: values.limits_containers?.toString(),
    [getProjectKey("limits_virtual_machines")]:
      values.limits_virtual_machines?.toString(),
    [getProjectKey("limits_disk")]: values.limits_disk?.toString(),
    [getProjectKey("limits_networks")]: values.limits_networks?.toString(),
    [getProjectKey("limits_cpu")]: values.limits_cpu?.toString(),
    [getProjectKey("limits_memory")]: values.limits_memory?.toString(),
    [getProjectKey("limits_processes")]: values.limits_processes?.toString(),
  };
};

interface Props {
  formik: FormikProps<ProjectFormValues>;
}

const ProjectResourceLimitsForm: FC<Props> = ({ formik }) => {
  return (
    <ScrollableConfigurationTable
      rows={[
        getConfigurationRow({
          formik,
          name: "limits_instances",
          label: "最大实例数",
          defaultValue: "",
          children: <Input placeholder="输入数值" min={0} type="number" />,
        }),

        getConfigurationRow({
          formik,
          name: "limits_containers",
          label: "最大容器数",
          defaultValue: "",
          children: <Input placeholder="输入数值" min={0} type="number" />,
        }),

        getConfigurationRow({
          formik,
          name: "limits_virtual_machines",
          label: "最大虚拟机数",
          defaultValue: "",
          children: <Input placeholder="输入数值" min={0} type="number" />,
        }),

        getConfigurationRow({
          formik,
          name: "limits_disk",
          label: "最大磁盘空间 (所有实例合计)",
          defaultValue: "",
          children: (
            <DiskSizeSelector
              setMemoryLimit={(val?: string) =>
                void formik.setFieldValue("limits_disk", val)
              }
            />
          ),
        }),

        getConfigurationRow({
          formik,
          name: "limits_networks",
          label: "最大网络数",
          defaultValue: "",
          children: <Input placeholder="输入数值" min={0} type="number" />,
        }),

        getConfigurationRow({
          formik,
          name: "limits_cpu",
          label: "最大 CPU 核心总数",
          defaultValue: "",
          children: <CpuLimitInput placeholder="输入数值" type="number" />,
        }),

        getConfigurationRow({
          formik,
          name: "limits_memory",
          label: "最大内存限制总和",
          defaultValue: "",
          children: (
            <DiskSizeSelector
              setMemoryLimit={(val?: string) =>
                void formik.setFieldValue("limits_memory", val)
              }
              helpTotal={<MemoryLimitAvailable />}
            />
          ),
        }),

        getConfigurationRow({
          formik,
          name: "limits_processes",
          label: "最大进程总数",
          defaultValue: "-",
          children: <Input placeholder="输入数值" min={0} type="number" />,
        }),
      ]}
    />
  );
};

export default ProjectResourceLimitsForm;
