import type { FC } from "react";
import { useState } from "react";
import {
  ConfirmationButton,
  Icon,
  useToastNotification,
} from "@canonical/react-components";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { deleteWarningBulk } from "api/warnings";
import { pluralize } from "util/instanceBulkActions";
import { useServerEntitlements } from "util/entitlements/server";

interface Props {
  warningIds: string[];
  onStart?: () => void;
  onFinish?: () => void;
}

const BulkDeleteWarningBtn: FC<Props> = ({ warningIds, onStart, onFinish }) => {
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const { canEditServerConfiguration } = useServerEntitlements();
  const canDeleteWarnings = canEditServerConfiguration();

  const handleDelete = () => {
    setLoading(true);
    onStart?.();
    deleteWarningBulk(warningIds)
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.warnings],
        });
        toastNotify.success(<>已删除 {warningIds.length} 条告警。</>);
      })
      .catch((e) => {
        toastNotify.failure("删除告警失败", e);
      })
      .finally(() => {
        setLoading(false);
        onFinish?.();
      });
  };

  const getHoverText = () => {
    if (!canDeleteWarnings) {
      return "你没有权限删除告警";
    }
    return "删除告警";
  };

  return (
    <ConfirmationButton
      onHoverText={getHoverText()}
      appearance="default"
      className="u-no-margin--bottom has-icon"
      loading={isLoading}
      confirmationModalProps={{
        title: "确认删除",
        children: (
          <p>
            这将永久删除{" "}
            <strong>
              {warningIds.length} 条告警
            </strong>
            <br />
            此操作无法撤销，并可能导致数据丢失。
          </p>
        ),
        onConfirm: handleDelete,
        confirmButtonLabel: "删除",
      }}
      disabled={!canDeleteWarnings || isLoading}
      shiftClickEnabled
      showShiftClickHint
      aria-label="删除"
    >
      <Icon name="delete" />
      <span>删除 {warningIds.length} 条告警</span>
    </ConfirmationButton>
  );
};

export default BulkDeleteWarningBtn;
