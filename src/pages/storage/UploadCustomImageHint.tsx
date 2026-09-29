import type { FC } from "react";
import { Icon } from "@canonical/react-components";

const UploadCustomImageHint: FC = () => {
  return (
    <>
      <div className={`p-notification--information`}>
        <div className="p-notification__content">
          <h3 className="p-notification__title">
            部分镜像格式需要进行调整才能在 Incus 中正常使用。
          </h3>
        </div>
      </div>
    </>
  );
};

export default UploadCustomImageHint;
