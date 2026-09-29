import type { FC } from "react";
import { useState } from "react";
import { Modal } from "@canonical/react-components";
import type { UploadState } from "types/storage";
import ProgressBar from "components/ProgressBar";
import { humanFileSize } from "util/helpers";
import UploadVolumeBackupFileForm from "./UploadVolumeBackupFileForm";
// import UploadExternalFormatFileForm from "./UploadExternalFormatFileForm";
import NotificationRow from "components/NotificationRow";
// import type { InstanceFileType } from "./InstanceFileTypeSelector";
interface Props {
  close: () => void;
  name?: string;
}

const UploadVolumeFileModal: FC<Props> = ({ close, name }) => {
  const [uploadState, setUploadState] = useState<UploadState | null>(null);

  return (
    <Modal
      close={close}
      className="upload-volume-modal"
      title="上传存储卷文件"
      closeOnOutsideClick={false}
    >
      <NotificationRow className="u-no-padding u-no-margin" />
      {uploadState && (
        <>
          <ProgressBar percentage={Math.floor(uploadState.percentage)} />
          <p>
            已上传 {humanFileSize(uploadState.loaded)} /{" "}
            {humanFileSize(uploadState.total ?? 0)}
          </p>
        </>
      )}

      <UploadVolumeBackupFileForm
        close={close}
        uploadState={uploadState}
        setUploadState={setUploadState}
        defaultVolumeName={name}
      />
    </Modal>
  );
};

export default UploadVolumeFileModal;
