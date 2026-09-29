import type { FC } from "react";
import ResourceLabel from "components/ResourceLabel";
import { Modal } from "@canonical/react-components";
import CodeSnippetWithCopyButton from "components/CodeSnippetWithCopyButton";

interface Props {
  onClose: () => void;
  token: string;
  identityName: string;
}

const CreateIdentityModal: FC<Props> = ({ onClose, token, identityName }) => {
  return (
    <Modal
      close={onClose}
      className="create-tls-identity"
      title="身份已创建"
    >
      {token && (
        <>
          <p>
            下面的身份信任令牌可用于以新创建的身份{" "}
            <ResourceLabel type="certificate" value={identityName} /> 登录。{" "}
            <b>
              此窗口关闭后，身份信任令牌将无法再次查看或生成。
            </b>
          </p>

          <CodeSnippetWithCopyButton code={token} />
        </>
      )}
    </Modal>
  );
};

export default CreateIdentityModal;
