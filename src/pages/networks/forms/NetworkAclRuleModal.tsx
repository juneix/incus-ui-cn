import type { FC } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
} from "@canonical/react-components";
import { useFormik } from "formik";
import type { RuleDirection } from "pages/networks/forms/NetworkAclForm";

export interface AclRuleFormValues {
  index?: number;
  action: "allow" | "reject" | "drop";
  description?: string;
  destination?: string;
  destination_port?: string;
  icmp_code?: string;
  icmp_type?: string;
  protocol?: "icmp4" | "icmp6" | "tcp" | "udp";
  source?: string;
  source_port?: string;
  state?: "enabled" | "disabled" | "logged";
}

interface Props {
  direction: RuleDirection;
  onClose: () => void;
  onAdd: (values: AclRuleFormValues) => void;
  editRule: AclRuleFormValues | null;
}

const NetworkAclRuleModal: FC<Props> = ({
  direction,
  onClose,
  onAdd,
  editRule,
}) => {
  const formik = useFormik<AclRuleFormValues>({
    initialValues: editRule
      ? editRule
      : {
          protocol: "tcp",
          action: "allow",
          state: "enabled",
        },
    enableReinitialize: true,
    onSubmit: (values) => {
      onAdd(values);
    },
  });

  const titleText =
    direction === "ingress"
      ? editRule
        ? "更新入站规则"
        : "添加入站规则"
      : editRule
        ? "更新出站规则"
        : "添加出站规则";

  return (
    <Modal
      close={onClose}
      title={titleText}
      buttonRow={
        <>
          <Button className="u-no-margin--bottom" onClick={onClose}>
            取消
          </Button>
          <Button
            appearance="positive"
            className="u-no-margin--bottom"
            onClick={formik.submitForm}
          >
            {editRule ? "更新规则" : "添加规则"}
          </Button>
        </>
      }
    >
      <Form onSubmit={formik.handleSubmit}>
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value="Hidden input" />
        <Select
          id="action"
          label="动作"
          options={[
            { label: "允许 (Allow)", value: "allow" },
            { label: "拒绝 (Reject)", value: "reject" },
            { label: "丢弃 (Drop)", value: "drop" },
          ]}
          {...formik.getFieldProps("action")}
        />
        <Select
          id="state"
          label="状态"
          options={[
            { label: "已启用 (Enabled)", value: "enabled" },
            { label: "已禁用 (Disabled)", value: "disabled" },
            { label: "已记录日志 (Logged)", value: "logged" },
          ]}
          help="可选值：已启用 (enabled)、已禁用 (disabled)、已记录日志 (logged)。"
          {...formik.getFieldProps("state")}
        />
        <Input
          id="description"
          label="描述"
          type="text"
          placeholder="输入描述"
          {...formik.getFieldProps("description")}
        />
        <Select
          id="protocol"
          label="协议"
          options={[
            { label: "任意 (Any)", value: "" },
            { label: "ICMP4", value: "icmp4" },
            { label: "ICMP6", value: "icmp6" },
            { label: "TCP", value: "tcp" },
            { label: "UDP", value: "udp" },
          ]}
          onBlur={formik.handleBlur}
          onChange={(e) => {
            if (e.target.value !== "tcp" && e.target.value !== "udp") {
              formik.setFieldValue("source_port", undefined);
              formik.setFieldValue("destination_port", undefined);
            }
            if (e.target.value !== "icmp4" && e.target.value !== "icmp6") {
              formik.setFieldValue("icmp_code", undefined);
              formik.setFieldValue("icmp_type", undefined);
            }
            formik.handleChange(e);
          }}
          value={formik.values.protocol}
        />
        <Input
          id="source"
          label="源地址"
          placeholder="输入源地址"
          type="text"
          help="源地址可以指定为 CIDR 或 IP 范围、源主体名称选择器（针对入站规则），留空表示任意。"
          {...formik.getFieldProps("source")}
        />
        {["tcp", "udp"].includes(formik.values.protocol ?? "") && (
          <Input
            id="source_port"
            label="源端口"
            placeholder="输入源端口"
            type="text"
            help="指定以逗号分隔的端口或端口范围（如 80,90-99），留空表示任意。"
            {...formik.getFieldProps("source_port")}
          />
        )}
        <Input
          id="destination"
          label="目标地址"
          placeholder="输入目标地址"
          type="text"
          help="目标地址可以指定为 CIDR 或 IP 范围、目标主体名称选择器（针对出站规则），留空表示任意。"
          {...formik.getFieldProps("destination")}
        />
        {["tcp", "udp"].includes(formik.values.protocol ?? "") && (
          <Input
            id="destination_port"
            label="目标端口"
            placeholder="输入目标端口"
            type="text"
            help="指定以逗号分隔的端口或端口范围（如 80,90-99），留空表示任意。"
            {...formik.getFieldProps("destination_port")}
          />
        )}
        {["icmp4", "icmp6"].includes(formik.values.protocol ?? "") && (
          <>
            <Input
              id="icmp_code"
              label="ICMP 代码"
              placeholder="输入 ICMP 代码"
              type="text"
              help="指定 ICMP 代码编号，留空表示任意。"
              {...formik.getFieldProps("icmp_code")}
            />
            <Input
              id="icmp_type"
              label="ICMP 类型"
              placeholder="输入 ICMP 类型"
              type="text"
              help="指定 ICMP 类型编号，留空表示任意。"
              {...formik.getFieldProps("icmp_type")}
            />
          </>
        )}
      </Form>
    </Modal>
  );
};

export default NetworkAclRuleModal;
