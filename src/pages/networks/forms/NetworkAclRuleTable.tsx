import type { FC } from "react";
import { Button, Icon, MainTable } from "@canonical/react-components";
import type { AclRuleFormValues } from "pages/networks/forms/NetworkAclRuleModal";
import { capitalizeFirstLetter } from "util/helpers";

interface Props {
  editRestriction?: string;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  rules: Partial<Omit<AclRuleFormValues, "direction">>[];
}

const NetworkAclRuleTable: FC<Props> = ({
  editRestriction,
  onEdit,
  onRemove,
  rules,
}) => {
  const getPeer = (address?: string, port?: string) => {
    return port ? `${address ?? "*"}:${port}` : `${address ?? "*"}`;
  };

  const actionMap: Record<string, string> = {
    allow: "允许",
    reject: "拒绝",
    drop: "丢弃",
  };

  const stateMap: Record<string, string> = {
    enabled: "已启用",
    disabled: "已禁用",
    logged: "已记录日志",
  };

  return (
    <MainTable
      sortable
      headers={[
        { content: "动作", sortKey: "action" },
        { content: "协议", sortKey: "protocol" },
        { content: "状态", sortKey: "state" },
        { content: "描述", sortKey: "description" },
        { content: "源地址", sortKey: "source" },
        { content: "目标地址", sortKey: "destination" },
        { content: "" },
      ]}
      rows={rules.map((rule, index) => {
        const source = getPeer(rule.source, rule.source_port);
        const destination = getPeer(rule.destination, rule.destination_port);

        return {
          columns: [
            {
              content: rule.action ? actionMap[rule.action] ?? capitalizeFirstLetter(rule.action) : "",
              role: "rowheader",
              "aria-label": "动作",
            },
            {
              content: `${(rule.protocol ?? "").length === 0 ? "任意" : rule.protocol?.toUpperCase()}`,
              role: "cell",
              "aria-label": "协议",
            },
            {
              content: rule.state ? stateMap[rule.state] ?? capitalizeFirstLetter(rule.state) : "",
              role: "cell",
              "aria-label": "状态",
            },
            {
              content: rule.description,
              role: "cell",
              "aria-label": "描述",
            },
            {
              content: source,
              role: "cell",
              "aria-label": "源地址",
            },
            {
              content: destination,
              role: "cell",
              "aria-label": "目标地址",
            },
            {
              content: (
                <>
                  <Button
                    onClick={() => {
                      onEdit(index);
                    }}
                    dense
                    type="button"
                    hasIcon
                    appearance="base"
                    disabled={!!editRestriction}
                    title={
                      "编辑规则" +
                      (editRestriction ? ` - ${editRestriction}` : "")
                    }
                  >
                    <Icon name="edit" />
                  </Button>
                  <Button
                    onClick={() => {
                      onRemove(index);
                    }}
                    dense
                    type="button"
                    hasIcon
                    appearance="base"
                    disabled={!!editRestriction}
                    title={
                      "删除规则" +
                      (editRestriction ? ` - ${editRestriction}` : "")
                    }
                  >
                    <Icon name="delete" />
                  </Button>
                </>
              ),
              role: "cell",
              className: "actions u-align--right",
            },
          ],
          sortData: {
            action: rule.action,
            protocol: rule.protocol,
            state: rule.state,
            description: rule.description,
            source: source,
            destination: destination,
          },
        };
      })}
    />
  );
};

export default NetworkAclRuleTable;
