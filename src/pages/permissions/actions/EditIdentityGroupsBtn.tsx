import type { FC } from "react";
import type { ButtonProps } from "@canonical/react-components";
import { Button, Icon } from "@canonical/react-components";
import type { LxdIdentity } from "types/permissions";
import usePanelParams from "util/usePanelParams";
import { useIdentityEntitlements } from "util/entitlements/identities";
import { pluralize } from "util/instanceBulkActions";
import { getIdentityName } from "util/permissionIdentities";

interface Props {
  identities: LxdIdentity[];
  className?: string;
}

const EditIdentityGroupsBtn: FC<Props & ButtonProps> = ({
  identities,
  className,
  ...buttonProps
}) => {
  const { canEditIdentity } = useIdentityEntitlements();
  const panelParams = usePanelParams();
  const buttonText =
    identities.length > 1
      ? `修改 ${identities.length} 个身份的用户组`
      : "修改用户组";

  const restrictedIdentities = identities.filter(
    (identity) => !canEditIdentity(identity),
  );

  const getRestrictedWarning = () => {
    const restrictedList = restrictedIdentities
      .map((identity) => `\n- ${getIdentityName(identity)}`)
      .join("");
    return `你没有权限修改${restrictedIdentities.length > 1 ? "部分已选" : "所选"}${pluralize("identity", restrictedIdentities.length)}：${restrictedList}`;
  };

  return (
    <>
      <Button
        onClick={() => {
          panelParams.openIdentityGroups();
        }}
        aria-label="修改用户组"
        title={
          restrictedIdentities.length ? getRestrictedWarning() : "修改用户组"
        }
        className={className}
        disabled={
          !!restrictedIdentities.length ||
          !identities.length ||
          !!panelParams.panel
        }
        hasIcon
        {...buttonProps}
      >
        <Icon name="user-group" />
        <span>{buttonText}</span>
      </Button>
    </>
  );
};

export default EditIdentityGroupsBtn;
