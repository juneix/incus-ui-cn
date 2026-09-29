import {
  ActionButton,
  Input,
  Modal,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { deleteGroups } from "api/auth-groups";
import ResourceLabel from "components/ResourceLabel";
import type { ChangeEvent, FC } from "react";
import { useState } from "react";
import type { LxdAuthGroup } from "types/permissions";
import { useGroupEntitlements } from "util/entitlements/groups";
import { pluralize } from "util/instanceBulkActions";
import { queryKeys } from "util/queryKeys";
import LoggedInUserNotification from "../panels/LoggedInUserNotification";
import { useSettings } from "context/useSettings";

interface Props {
  groups: LxdAuthGroup[];
  close: () => void;
}

const DeleteGroupModal: FC<Props> = ({ groups, close }) => {
  const queryClient = useQueryClient();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [confirmInput, setConfirmInput] = useState("");
  const [disableConfirm, setDisableConfirm] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const confirmText = "confirm-delete-group";
  const { canDeleteGroup } = useGroupEntitlements();
  const { data: settings } = useSettings();
  const loggedInIdentityID = settings?.auth_user_name ?? "";

  const restrictedGroups: LxdAuthGroup[] = [];
  const deletableGroups: LxdAuthGroup[] = [];
  let hasGroupsForLoggedInUser = false;
  groups.forEach((group) => {
    if (canDeleteGroup(group)) {
      if (group.identities?.oidc?.includes(loggedInIdentityID)) {
        hasGroupsForLoggedInUser = true;
      }

      if (group.identities?.tls?.includes(loggedInIdentityID)) {
        hasGroupsForLoggedInUser = true;
      }

      deletableGroups.push(group);
    } else {
      restrictedGroups.push(group);
    }
  });

  const hasOneGroup = deletableGroups.length === 1;

  const handleConfirmInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === confirmText) {
      setDisableConfirm(false);
    } else {
      setDisableConfirm(true);
    }

    setConfirmInput(e.target.value);
  };

  const handleDeleteGroups = () => {
    setSubmitting(true);
    const hasSingleGroup = deletableGroups.length === 1;

    const successMessage = hasSingleGroup ? (
      <>
        用户组{" "}
        <ResourceLabel bold type="auth-group" value={deletableGroups[0].name} />{" "}
        已删除。
      </>
    ) : (
      `已删除 ${deletableGroups.length} 个用户组。`
    );

    deleteGroups(deletableGroups.map((group) => group.name))
      .then(() => {
        queryClient.invalidateQueries({
          predicate: (query) => {
            return [queryKeys.identities, queryKeys.authGroups].includes(
              query.queryKey[0] as string,
            );
          },
        });
        toastNotify.success(successMessage);
        close();
      })
      .catch((e) => {
        notify.failure(
          `删除 ${deletableGroups.length} 个用户组失败。`,
          e,
        );
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const getModalContent = () => {
    const breakdown = restrictedGroups.length ? (
      <>
        <li className="p-list__item">
          -{" "}
          {`将删除 ${deletableGroups.length} 个用户组。`}
        </li>
        <li className="p-list__item">
          -{" "}
          {`将忽略 ${restrictedGroups.length} 个你无权删除的用户组。`}
        </li>
      </>
    ) : null;

    const deleteText = hasOneGroup ? (
      <>
        {" "}
        用户组{" "}
        <ResourceLabel type="auth-group" value={deletableGroups[0].name} bold />
      </>
    ) : (
      <>
        <strong>{deletableGroups.length}</strong> 个用户组
      </>
    );

    return (
      <>
        {breakdown && (
          <>
            <p>
              已选择 <b>{groups.length}</b> 个用户组：
            </p>
            <ul className="p-list">{breakdown}</ul>
          </>
        )}
        <p className="u-no-padding--top">
          这将永久删除 {deleteText}。{"\n"}此操作无法撤销，并可能导致用户失去访问 Incus 的权限，甚至可能导致所有用户失去管理员权限。
        </p>
        {hasGroupsForLoggedInUser && (
          <div className="u-sv1">
            <LoggedInUserNotification isVisible={hasGroupsForLoggedInUser} />
          </div>
        )}
        <p>如需继续，请在下方输入确认文字。</p>
        <p>
          <strong>{confirmText}</strong>
        </p>
      </>
    );
  };

  return (
    <Modal
      title="确认删除用户组"
      className="delete-group-confirm-modal"
      close={close}
      buttonRow={[
        <span className="u-float-left confirm-input" key="confirm-input">
          <Input
            id="confirm-delete-group-input"
            name="confirm-delete-group-input"
            type="text"
            onChange={handleConfirmInputChange}
            value={confirmInput}
            placeholder={confirmText}
            className="u-no-margin--bottom"
            disabled={!deletableGroups.length}
          />
        </span>,
        <ActionButton
          key="confirm-action-button"
          appearance="negative"
          className="u-no-margin--bottom"
          onClick={handleDeleteGroups}
          loading={submitting}
          disabled={disableConfirm || submitting}
        >
          {`永久删除 ${deletableGroups.length} 个用户组`}
        </ActionButton>,
      ]}
    >
      {getModalContent()}
    </Modal>
  );
};

export default DeleteGroupModal;
