import type { FC } from "react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import type { LxdIdentity } from "types/permissions";
import { deleteIdentity } from "api/auth-identities";
import { useIdentityEntitlements } from "util/entitlements/identities";
import LoggedInUserNotification from "pages/permissions/panels/LoggedInUserNotification";
import { useSettings } from "context/useSettings";
import { logout } from "util/helpers";
import ResourceLabel from "components/ResourceLabel";

interface Props {
  identity: LxdIdentity;
}

const DeleteIdentityBtn: FC<Props> = ({ identity }) => {
  const queryClient = useQueryClient();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isDeleting, setDeleting] = useState(false);
  const { canDeleteIdentity } = useIdentityEntitlements();
  const { data: settings } = useSettings();
  const loggedInIdentityID = settings?.auth_user_name ?? "";
  const isSelf = identity.id === loggedInIdentityID;

  const handleDelete = () => {
    setDeleting(true);
    deleteIdentity(identity)
      .then(() => {
        if (isSelf && settings?.auth_user_method === "oidc") {
          // special case for OIDC users, as they would be recreated via the api on the next request
          // force a logout to prevent re-creation
          logout();
          return;
        }
        queryClient.invalidateQueries({
          predicate: (query) => {
            return [
              queryKeys.identities,
              queryKeys.authGroups,
              queryKeys.settings,
            ].includes(query.queryKey[0] as string);
          },
        });
        toastNotify.success(
          <>
            身份{" "}
            <ResourceLabel
              type="certificate"
              value={identity.name}
              bold
              truncate
            />{" "}
            已删除。
          </>,
        );
        setDeleting(false);
        close();
      })
      .catch((e) => {
        setDeleting(false);
        notify.failure(
          "删除身份失败",
          e,
          <ResourceLabel
            type="certificate"
            value={identity.name}
            bold
            truncate
          />,
        );
      });
  };

  return (
    <ConfirmationButton
      onHoverText={
        canDeleteIdentity(identity)
          ? "删除身份"
          : "你没有权限删除该身份"
      }
      appearance="base"
      aria-label="删除身份"
      className="has-icon u-no-margin--bottom is-dense"
      confirmationModalProps={{
        title: "确认删除",
        children: (
          <>
            <LoggedInUserNotification isVisible={isSelf} />
            <p>
              这将永久删除身份{" "}
              <ResourceLabel type="certificate" value={identity.name} bold />
              。
              <br />
              此操作无法撤销，并可能导致数据丢失。
            </p>
          </>
        ),
        confirmButtonLabel: "删除",
        onConfirm: handleDelete,
      }}
      shiftClickEnabled
      showShiftClickHint
      loading={isDeleting}
      disabled={!canDeleteIdentity(identity) || isDeleting}
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteIdentityBtn;
