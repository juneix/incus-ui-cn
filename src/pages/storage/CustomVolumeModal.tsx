import type { FC, ReactNode } from "react";
import { useState } from "react";
import CustomVolumeSelectModal from "pages/storage/CustomVolumeSelectModal";
import CustomVolumeCreateModal from "pages/storage/CustomVolumeCreateModal";
import { Modal } from "@canonical/react-components";
import type { LxdStorageVolume } from "types/storage";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import { getInstanceLocation } from "util/instanceLocation";
import BackLink from "components/BackLink";

interface Props {
  formik: InstanceAndProfileFormikProps;
  project: string;
  onFinish: (volume: LxdStorageVolume) => void;
  onCancel: () => void;
  onClose: () => void;
  title?: ReactNode;
}

const SELECT_VOLUME = "selectVolume";
const CREATE_VOLUME = "createVolume";

const CustomVolumeModal: FC<Props> = ({
  formik,
  project,
  onFinish,
  onCancel,
  onClose,
  title,
}) => {
  const [content, setContent] = useState(SELECT_VOLUME);
  const [primaryVolume, setPrimaryVolume] = useState<
    LxdStorageVolume | undefined
  >(undefined);

  const instanceLocation = getInstanceLocation(formik);

  const handleCreateVolume = (volume: LxdStorageVolume) => {
    setContent(SELECT_VOLUME);
    setPrimaryVolume(volume);
  };

  const handleGoBack = () => {
    setContent(SELECT_VOLUME);
  };

  let modalTitle = title ?? "选择自定义卷";
  if (content === CREATE_VOLUME) {
    modalTitle = title ? (
      <BackLink
        title="创建卷"
        onClick={handleGoBack}
        linkText="附加自定义卷"
      />
    ) : (
      "创建卷"
    );
  }

  return (
    <Modal className="custom-volume-modal" close={onClose} title={modalTitle}>
      {content === SELECT_VOLUME && (
        <CustomVolumeSelectModal
          project={project}
          primaryVolume={primaryVolume}
          instanceLocation={instanceLocation}
          onFinish={onFinish}
          onCancel={onCancel}
          onCreate={() => {
            setContent(CREATE_VOLUME);
          }}
          hasPrevStep={!!title}
        />
      )}
      {content === CREATE_VOLUME && (
        <CustomVolumeCreateModal
          project={project}
          instanceLocation={instanceLocation}
          onCancel={handleGoBack}
          onFinish={handleCreateVolume}
        />
      )}
    </Modal>
  );
};

export default CustomVolumeModal;
