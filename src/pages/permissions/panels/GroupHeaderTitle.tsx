import type { FC } from "react";
import type { LxdAuthGroup } from "types/permissions";
import type { GroupSubForm } from "pages/permissions/panels/CreateGroupPanel";
import BackLink from "components/BackLink";

interface Props {
  subForm: GroupSubForm;
  setSubForm: (subForm: GroupSubForm) => void;
  group?: LxdAuthGroup;
}

const GroupHeaderTitle: FC<Props> = ({ subForm, setSubForm, group }) => {
  if (subForm === null) {
    return group ? `编辑授权用户组 ${group?.name}` : "创建授权用户组";
  }

  const action = subForm === "identity" ? "身份" : "权限";

  return (
    <BackLink
      linkText={group ? "编辑授权用户组" : "创建授权用户组"}
      title={`${group ? "编辑" : "添加"}${action}`}
      onClick={() => {
        setSubForm(null);
      }}
    />
  );
};

export default GroupHeaderTitle;
