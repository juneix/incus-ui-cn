import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import type { LxdInstance } from "types/instance";
import { Button, Icon } from "@canonical/react-components";

interface Props {
  instance: LxdInstance;
}

const OpenConsoleBtn: FC<Props> = ({ instance }) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(
      `/ui/project/${encodeURIComponent(instance.project)}/instance/${encodeURIComponent(instance.name)}/console`,
    );
  };

  return (
    <Button
      aria-label="打开控制台"
      appearance="base"
      dense
      hasIcon
      onClick={handleOpen}
      title="控制台"
    >
      <Icon name="canvas" />
    </Button>
  );
};

export default OpenConsoleBtn;
