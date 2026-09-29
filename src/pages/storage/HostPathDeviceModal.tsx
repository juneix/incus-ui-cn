import type { FC, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Button, Input, Modal } from "@canonical/react-components";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import type { LxdDiskDevice } from "types/device";
import { focusField } from "util/formFields";

interface Props {
  formik: InstanceAndProfileFormikProps;
  onFinish: (device: LxdDiskDevice) => void;
  onCancel: () => void;
  onClose: () => void;
  title?: ReactNode;
}

const HostPathDeviceModal: FC<Props> = ({
  formik,
  onFinish,
  onCancel,
  onClose,
  title,
}) => {
  const [source, setSource] = useState("");
  const [path, setPath] = useState("");
  const touchedRef = useRef({
    source: false,
    path: false,
  });

  useEffect(() => {
    focusField("host-path");
  }, []);

  const handleFinish = () => {
    const device: LxdDiskDevice = {
      type: "disk",
      source,
      path,
    };

    onFinish(device);
  };

  return (
    <Modal
      className="host-path-device-modal"
      close={onClose}
      title={title}
      buttonRow={
        <>
          <Button
            appearance="base"
            className="u-no-margin--bottom"
            type="button"
            onClick={onCancel}
          >
            返回
          </Button>
          <Button
            appearance=""
            className="u-no-margin--bottom"
            type="button"
            loading={formik.isSubmitting}
            disabled={!source || !path || formik.isSubmitting}
            onClick={handleFinish}
          >
            挂载
          </Button>
        </>
      }
    >
      <Input
        id="host-path"
        value={source}
        onChange={(e) => {
          touchedRef.current.source = true;
          setSource(e.target.value);
        }}
        type="text"
        label="宿主机路径"
        required
        error={
          !source && touchedRef.current.source
            ? "宿主机路径为必填项"
            : undefined
        }
        placeholder="请输入完整路径（如 /home）"
      />
      <Input
        value={path}
        onChange={(e) => {
          touchedRef.current.path = true;
          setPath(e.target.value);
        }}
        type="text"
        label="挂载点路径"
        required
        error={
          !path && touchedRef.current.path
            ? "挂载点路径为必填项"
            : undefined
        }
        placeholder="请输入完整路径（如 /data）"
      />
    </Modal>
  );
};

export default HostPathDeviceModal;
