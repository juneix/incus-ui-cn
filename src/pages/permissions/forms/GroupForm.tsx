import type { FC, ReactNode } from "react";
import { Form, Input } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import type { GroupSubForm } from "pages/permissions/panels/CreateGroupPanel";
import FormLink from "components/FormLink";
import { pluralize } from "util/instanceBulkActions";
import type { LxdAuthGroup } from "types/permissions";
import { useGroupEntitlements } from "util/entitlements/groups";

export interface GroupFormValues {
  name: string;
  description: string;
}

interface Props {
  formik: FormikProps<GroupFormValues>;
  setSubForm: (subForm: GroupSubForm) => void;
  identityCount: number;
  identityModifyCount: number;
  permissionCount: number;
  permissionModifyCount: number;
  isEditing?: boolean;
  group?: LxdAuthGroup;
}

const GroupForm: FC<Props> = ({
  formik,
  setSubForm,
  identityCount,
  identityModifyCount,
  permissionCount,
  permissionModifyCount,
  isEditing = true,
  group,
}) => {
  const { canEditGroup } = useGroupEntitlements();
  const getFormProps = (id: "name" | "description") => {
    return {
      id: id,
      name: id,
      onBlur: formik.handleBlur,
      onChange: formik.handleChange,
      value: formik.values[id] ?? "",
      error: formik.touched[id] ? (formik.errors[id] as ReactNode) : null,
      placeholder: `请输入${id === "name" ? "名称" : "描述"}`,
    };
  };

  const groupEditRestriction =
    !isEditing || canEditGroup(group)
      ? ""
      : "你没有权限修改该用户组";

  return (
    <Form onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="隐藏输入框" />
      <Input
        {...getFormProps("name")}
        type="text"
        label="名称"
        required
        autoFocus
        disabled={!!groupEditRestriction}
        title={groupEditRestriction}
      />
      <AutoExpandingTextArea
        {...getFormProps("description")}
        label="描述"
        disabled={!!groupEditRestriction}
        title={groupEditRestriction}
      />
      <FormLink
        title={`${isEditing ? "编辑" : "添加"}身份`}
        icon="user-group"
        onClick={() => {
          setSubForm("identity");
        }}
        isModified={identityModifyCount > 0}
        subText={
          identityCount === 0
            ? "暂无身份"
            : `${identityCount} 个身份`
        }
      />
      <FormLink
        title={`${isEditing ? "编辑" : "添加"}权限`}
        icon="lock-locked"
        onClick={() => {
          setSubForm("permission");
        }}
        isModified={permissionModifyCount > 0}
        subText={
          permissionCount === 0
            ? "暂无权限"
            : `${permissionCount} 项权限`
        }
      />
    </Form>
  );
};

export default GroupForm;
