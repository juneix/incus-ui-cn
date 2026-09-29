import type { FC } from "react";
import {
  ActionButton,
  Button,
  Input,
  Modal,
  Notification,
  NotificationConsumer,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { updateCluster } from "api/cluster";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNavigate } from "react-router-dom";
import { useSettings } from "context/useSettings";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateSettings } from "api/server";

interface Props {
  onClose: () => void;
}

const EnableClusteringModal: FC<Props> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const navigate = useNavigate();
  const { data: settings } = useSettings();

  const ClusteringSchema = Yup.object().shape({
    serverName: Yup.string().required("此字段不能为空"),
    clusterAddress: Yup.string().required("此字段不能为空"),
  });

  interface ClusteringValues {
    serverName: string;
    clusterAddress: string;
  }

  const formik = useFormik<ClusteringValues>({
    initialValues: {
      serverName: "",
      clusterAddress: settings?.config?.["cluster.https_address"] ?? "",
    },
    enableReinitialize: true,
    validationSchema: ClusteringSchema,
    onSubmit: async (values) => {
      try {
        await updateSettings({
          "cluster.https_address": String(values.clusterAddress),
        });
      } catch (e) {
        notify.failure("更新集群地址失败", e);
        return;
      }
      const payload = JSON.stringify({
        server_name: values.serverName,
        enabled: true,
      });
      updateCluster(payload)
        .then(() => {
          toastNotify.success("已启用集群。");
          queryClient.invalidateQueries({
            queryKey: [queryKeys.settings],
          });
          navigate("/ui/cluster/members");
        })
        .catch((e) => {
          notify.failure("启用集群失败", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
        });
    },
  });

  return (
    <Modal
      close={onClose}
      title="启用集群"
      className="enable-clustering-modal"
      buttonRow={
        <>
          <Button
            aria-label="关闭"
            className="u-no-margin--bottom"
            onClick={onClose}
            type="button"
          >
            关闭
          </Button>
          <ActionButton
            appearance="positive"
            loading={formik.isSubmitting}
            className="u-no-margin--bottom"
            onClick={() => void formik.submitForm()}
            disabled={
              !formik.values.serverName || !formik.values.clusterAddress
            }
            type="button"
          >
            启用集群
          </ActionButton>
        </>
      }
    >
      <NotificationConsumer />
      <Notification
        severity="caution"
        title="确定要启用集群吗？"
      >
        此操作无法撤销。
      </Notification>
      <Input
        label="服务器名称"
        type="text"
        required
        {...formik.getFieldProps("serverName")}
      />
      <Input
        label="集群地址"
        type="text"
        help="该服务器用于集群通信的地址"
        required
        {...formik.getFieldProps("clusterAddress")}
      />
    </Modal>
  );
};

export default EnableClusteringModal;
