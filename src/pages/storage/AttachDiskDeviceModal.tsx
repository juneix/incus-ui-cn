import type { FC, KeyboardEvent } from "react";
import { useState } from "react";
import { Modal } from "@canonical/react-components";
import FormLink from "components/FormLink";
import BackLink from "components/BackLink";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import CustomVolumeModal from "./CustomVolumeModal";
import type { LxdDiskDevice } from "types/device";
import HostPathDeviceModal from "./HostPathDeviceModal";
import SpecialDiskModal from "./SpecialDiskModal";
import type { LxdStorageVolume } from "types/storage";

type DiskDeviceType =
  | "custom volume"
  | "host path"
  | "special device"
  | "choose type";

interface Props {
  close: () => void;
  onFinish: (device: LxdDiskDevice) => void;
  formik: InstanceAndProfileFormikProps;
  project: string;
}

const AttachDiskDeviceModal: FC<Props> = ({
  close,
  formik,
  project,
  onFinish,
}) => {
  const [type, setType] = useState<DiskDeviceType>("choose type");

  const showSpecialDisk =
    (formik.values.entityType == "instance" &&
      formik.values.instanceType == "virtual-machine") ||
    formik.values.entityType == "profile"
      ? true
      : false;

  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      close();
    }
  };

  const handleGoBack = () => {
    setType("choose type");
  };

  const handleSelectVolume = (volume: LxdStorageVolume) => {
    const device: LxdDiskDevice = {
      type: "disk",
      pool: volume.pool,
      source: volume.name,
      path: volume.content_type === "filesystem" ? "" : undefined,
    };

    onFinish(device);
  };

  const modalTitle =
    type === "choose type" ? (
      "选择磁盘类型"
    ) : (
      <BackLink
        title={
          type === "host path"
            ? "挂载宿主机路径"
            : type === "custom volume"
              ? "挂载自定义存储卷"
              : "挂载特殊磁盘设备"
        }
        onClick={handleGoBack}
        linkText="选择磁盘类型"
      />
    );

  return (
    <>
      {type === "choose type" && (
        <Modal
          close={close}
          className="migrate-instance-modal"
          title={modalTitle}
          onKeyDown={handleEscKey}
        >
          <div className="choose-migration-type">
            <FormLink
              icon="add-logical-volume"
              title="挂载自定义存储卷"
              onClick={() => {
                setType("custom volume");
              }}
            />
            <FormLink
              icon="mount"
              title="挂载宿主机路径"
              onClick={() => {
                setType("host path");
              }}
            />
            {showSpecialDisk && (
              <FormLink
                icon="file"
                title="特殊磁盘设备"
                onClick={() => setType("special device")}
              />
            )}
          </div>
        </Modal>
      )}

      {type === "custom volume" && (
        <CustomVolumeModal
          formik={formik}
          project={project}
          onFinish={handleSelectVolume}
          onCancel={handleGoBack}
          onClose={close}
          title={modalTitle}
        />
      )}

      {type === "host path" && (
        <HostPathDeviceModal
          formik={formik}
          onFinish={onFinish}
          onCancel={handleGoBack}
          onClose={close}
          title={modalTitle}
        />
      )}

      {type === "special device" && (
        <SpecialDiskModal
          formik={formik}
          onFinish={onFinish}
          onCancel={handleGoBack}
          onClose={close}
          title={modalTitle}
        />
      )}
    </>
  );
};

export default AttachDiskDeviceModal;
