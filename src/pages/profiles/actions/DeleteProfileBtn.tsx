import type { FC } from "react";
import { useState } from "react";
import { deleteProfile } from "api/profiles";
import { useNavigate } from "react-router-dom";
import type { LxdProfile } from "types/profile";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import classnames from "classnames";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import ResourceLabel from "components/ResourceLabel";
import { useProfileEntitlements } from "util/entitlements/profiles";

interface Props {
  profile: LxdProfile;
  project: string;
}

const DeleteProfileBtn: FC<Props> = ({ profile, project }) => {
  const isSmallScreen = useIsScreenBelow();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { canDeleteProfile } = useProfileEntitlements();

  const handleDelete = () => {
    setLoading(true);
    deleteProfile(profile.name, project)
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.projects, project],
        });
        navigate(`/ui/project/${encodeURIComponent(project)}/profiles`);
        toastNotify.success(
          <>
            配置模板 <ResourceLabel bold type="profile" value={profile.name} />{" "}
            已删除。
          </>,
        );
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("删除配置模板失败", e);
      });
  };

  const isDefaultProfile = profile.name === "default";
  const getHoverText = () => {
    if (!canDeleteProfile(profile)) {
      return "你没有权限删除此配置模板";
    }

    if (isDefaultProfile) {
      return "默认配置模板无法被删除";
    }
    return "删除配置模板";
  };

  return (
    <ConfirmationButton
      onHoverText={getHoverText()}
      className={classnames("u-no-margin--bottom", {
        "has-icon": !isSmallScreen,
      })}
      disabled={!canDeleteProfile(profile) || isDefaultProfile || isLoading}
      loading={isLoading}
      confirmationModalProps={{
        title: "确认删除",
        confirmButtonLabel: "删除",
        onConfirm: handleDelete,
        children: (
          <p>
            这将永久删除配置模板{" "}
            <ResourceLabel type="profile" value={profile.name} bold />。<br />
            此操作无法撤销，并可能导致数据丢失。
          </p>
        ),
      }}
      shiftClickEnabled
      showShiftClickHint
    >
      {!isSmallScreen && <Icon name="delete" />}
      <span>删除</span>
    </ConfirmationButton>
  );
};

export default DeleteProfileBtn;
