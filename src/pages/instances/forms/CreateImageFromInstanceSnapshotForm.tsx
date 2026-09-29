import type { FC } from "react";
import type { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import { useEventQueue } from "context/eventQueue";
import { useFormik } from "formik";
import { createImage, createImageAlias } from "api/images";
import {
  ActionButton,
  Button,
  Form,
  Input,
  Modal,
  useToastNotification,
} from "@canonical/react-components";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import InstanceSnapshotLinkChip from "../InstanceSnapshotLinkChip";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProject } from "context/useProjects";

interface Props {
  instance: LxdInstance;
  snapshot: LxdInstanceSnapshot;
  close: () => void;
}

const CreateImageFromInstanceSnapshotForm: FC<Props> = ({
  instance,
  snapshot,
  close,
}) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const snapshotLink = (
    <InstanceSnapshotLinkChip name={snapshot.name} instance={instance} />
  );
  const { data: project } = useProject(instance.project);
  const { canCreateImageAliases } = useProjectEntitlements();

  const notifySuccess = () => {
    const created = (
      <Link to={`/ui/project/${encodeURIComponent(instance.project)}/images`}>
        created
      </Link>
    );
    toastNotify.success(
      <>
        Image {created} from snapshot {snapshotLink}.
      </>,
    );
  };

  const clearCache = () => {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === queryKeys.images,
    });
  };

  const getSnapshotToImageBody = (
    instance: LxdInstance,
    snapshot: LxdInstanceSnapshot,
    isPublic: boolean,
  ): string => {
    const body = JSON.stringify({
      public: isPublic,
      source: {
        type: "snapshot",
        name: `${instance.name}/${snapshot.name}`,
      },
    });

    return body;
  };

  const formik = useFormik<{ alias: string; isPublic: boolean }>({
    initialValues: {
      alias: "",
      isPublic: false,
    },
    validationSchema: Yup.object().shape({
      alias: Yup.string(),
    }),
    onSubmit: (values) => {
      const alias = values.alias;

      createImage(
        getSnapshotToImageBody(instance, snapshot, values.isPublic),
        instance,
      )
        .then((operation) => {
          toastNotify.info(
            <>Creation of image from snapshot {snapshotLink} started.</>,
          );
          eventQueue.set(
            operation.metadata.id,
            (event) => {
              if (alias) {
                const fingerprint = event.metadata.metadata?.fingerprint ?? "";
                createImageAlias(fingerprint, alias, instance.project)
                  .then(clearCache)
                  .then(notifySuccess)
                  .catch((e) => {
                    toastNotify.failure(
                      `Image creation from snapshot "${snapshot.name}" succeeded. Failed to create an alias.`,
                      e,
                    );
                  });
              } else {
                clearCache();
                notifySuccess();
              }
            },
            (msg) => {
              toastNotify.failure(
                `Image creation from snapshot "${snapshot.name}" failed.`,
                new Error(msg),
                snapshotLink,
              );
            },
          );
        })
        .catch((e) => {
          toastNotify.failure(
            `Image creation from snapshot "${snapshot.name}" failed.`,
            e,
            snapshotLink,
          );
        })
        .finally(() => {
          close();
        });
    },
  });

  return (
    <Modal
      close={close}
      title="从实例快照创建镜像"
      buttonRow={
        <>
          <Button
            appearance="base"
            className="u-no-margin--bottom"
            type="button"
            onClick={close}
          >
            取消
          </Button>
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            loading={formik.isSubmitting}
            disabled={!formik.isValid || formik.isSubmitting}
            onClick={() => void formik.submitForm()}
          >
            创建镜像
          </ActionButton>
        </>
      }
    >
      <Form onSubmit={formik.handleSubmit}>
        <Input type="text" label="实例" value={instance.name} disabled />
        <Input type="text" label="快照" value={snapshot.name} disabled />
        <Input
          {...formik.getFieldProps("alias")}
          type="text"
          label="别名"
          error={formik.touched.alias ? formik.errors.alias : null}
          disabled={!canCreateImageAliases(project)}
          title={
            canCreateImageAliases(project)
              ? ""
              : "你没有权限在此项目中创建镜像别名"
          }
        />
        <Input
          {...formik.getFieldProps("isPublic")}
          type="checkbox"
          label="将镜像设为公开可用"
          error={formik.touched.isPublic ? formik.errors.isPublic : null}
        />
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value="Hidden input" />
      </Form>
    </Modal>
  );
};

export default CreateImageFromInstanceSnapshotForm;
