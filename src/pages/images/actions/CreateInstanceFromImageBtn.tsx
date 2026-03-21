import type { FC } from "react";
import type { RemoteImage } from "types/image";
import { Button, Icon } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProject } from "context/useProjects";

interface Props {
  image: RemoteImage;
  projectName: string;
}

const CreateInstanceFromImageBtn: FC<Props> = ({ image, projectName }) => {
  const navigate = useNavigate();
  const { canCreateInstances } = useProjectEntitlements();
  const { data: project } = useProject(projectName);

  const openLaunchFlow = () => {
    navigate(
      `/ui/project/${encodeURIComponent(projectName)}/instances/create`,
      {
        state: {
          selectedImage: image,
          cancelLocation: window.location.pathname,
        },
      },
    );
  };

  return (
    <Button
      appearance="base"
      onClick={openLaunchFlow}
      type="button"
      title={
        canCreateInstances(project)
          ? "创建实例"
          : "你没有创建实例的权限"
      }
      hasIcon
      disabled={!canCreateInstances(project)}
    >
      <Icon name="play" />
    </Button>
  );
};

export default CreateInstanceFromImageBtn;
