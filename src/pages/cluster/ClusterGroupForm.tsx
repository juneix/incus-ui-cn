import type { FC } from "react";
import { Form, Icon, Input } from "@canonical/react-components";
import type { LxdClusterGroup } from "types/cluster";
import type { FormikProps } from "formik/dist/types";
import { useClusterMembers } from "context/useClusterMembers";
import SelectableMainTable from "components/SelectableMainTable";

export interface ClusterGroupFormValues {
  name: string;
  description: string;
  members: string[];
  bareGroup?: LxdClusterGroup;
}

export interface Props {
  formik: FormikProps<ClusterGroupFormValues>;
}

const ClusterGroupForm: FC<Props> = ({ formik }) => {
  const { data: members = [] } = useClusterMembers();

  const previousMembers = formik.values.bareGroup?.members ?? [];
  const addedMembers = formik.values.members.filter(
    (member) => !previousMembers.includes(member),
  );
  const removedMembers = previousMembers.filter(
    (members) => !formik.values.members.includes(members),
  );
  const modifiedMembers = [...addedMembers, ...removedMembers];
  const preselectedMembers = new Set(formik.values.bareGroup?.members ?? []);

  const sortedMembers = members.sort((a, b) => {
    if (preselectedMembers.has(a.server_name)) {
      return -1;
    }
    if (preselectedMembers.has(b.server_name)) {
      return 1;
    }
    return 0;
  });

  return (
    <Form onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      {!formik.values.bareGroup && (
        <Input
          {...formik.getFieldProps("name")}
          type="text"
          label="名称"
          placeholder="输入名称"
          required
          autoFocus
          error={formik.touched.name ? formik.errors.name : null}
        />
      )}
      <Input
        {...formik.getFieldProps("description")}
        type="text"
        label="描述"
        placeholder="输入描述"
      />
      <p className="u-sv-1">集群成员</p>
      <SelectableMainTable
        itemName="个成员"
        parentName="集群组"
        className="member-selection-table"
        filteredNames={members?.map((member) => member.server_name) ?? []}
        selectedNames={formik.values.members}
        hideContextualMenu
        setSelectedNames={(val, isUnselectAll) => {
          if (isUnselectAll) {
            formik.setFieldValue("members", []);
            return;
          }
          formik.setFieldValue("members", val);
        }}
        disabledNames={[]}
        headers={[
          {
            content: "名称",
            sortKey: "name",
            className: "name",
          },
          {
            content: "所属组",
            className: "groups u-align--right",
          },
          {
            content: "",
            "aria-label": "修改状态",
            className: "modified-status",
          },
        ]}
        rows={
          sortedMembers.map((member) => {
            const name = member.server_name;
            const groups = (member.groups ?? []).length;

            const toggleRow = () => {
              if (formik.values.members.includes(name)) {
                formik.setFieldValue(
                  "members",
                  formik.values.members.filter((m) => m !== name),
                );
              } else {
                formik.setFieldValue("members", [
                  ...formik.values.members,
                  name,
                ]);
              }
            };
            const isModified = modifiedMembers.includes(name);

            return {
              key: name,
              name: name,
              columns: [
                {
                  content: name,
                  title: name,
                  onClick: toggleRow,
                  role: "rowheader",
                  className: "name u-truncate clickable-cell",
                  "aria-label": "名称",
                },
                {
                  content: groups,
                  onClick: toggleRow,
                  role: "cell",
                  className: "groups u-truncate clickable-cell u-align--right",
                  "aria-label": "所属组",
                },
                {
                  content: isModified && (
                    <Icon
                      name="status-in-progress-small"
                      aria-label={
                        addedMembers.includes(name)
                          ? "已添加"
                          : "已移除"
                      }
                    />
                  ),
                  role: "cell",
                  "aria-label": "修改状态",
                  className: "modified-status u-align--right",
                },
              ],
            };
          }) ?? []
        }
      />
    </Form>
  );
};

export default ClusterGroupForm;
