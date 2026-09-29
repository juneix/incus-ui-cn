import type { FC, KeyboardEvent } from "react";
import { useState } from "react";
import { Modal } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import FormLink from "components/FormLink";
import InstanceClusterMemberMigration from "./InstanceClusterMemberMigration";
import BackLink from "components/BackLink";
import InstanceStoragePoolMigration from "./InstanceStoragePoolMigration";
import type { MigrationType } from "util/instanceMigration";
import { useInstanceMigration } from "util/instanceMigration";
import InstanceProjectMigration from "pages/instances/InstanceProjectMigration";
import { useIsClustered } from "context/useIsClustered";

interface Props {
  close: () => void;
  instance: LxdInstance;
}

const MigrateInstanceModal: FC<Props> = ({ close, instance }) => {
  const isClustered = useIsClustered();
  const [type, setType] = useState<MigrationType>("");
  const [target, setTarget] = useState("");
  const { handleMigrate } = useInstanceMigration({
    close,
    instance,
    type,
  });

  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      close();
    }
  };

  const handleGoBack = () => {
    // if target is set, we are on the confirmation stage
    if (target) {
      setTarget("");
      return;
    }

    // if type is set, we are on migration target selection stage
    if (type) {
      setType("");
      return;
    }
  };

  const typeNames: Record<string, string> = {
    "cluster member": "集群成员",
    "root storage pool": "根存储池",
    project: "项目",
  };

  const selectStepTitle = (
    <>
      为实例 <strong>{instance.name}</strong> 选择目标{typeNames[type] ?? type}
    </>
  );

  const modalTitle = !type ? (
    "选择迁移方式"
  ) : (
    <BackLink
      title={target ? "确认迁移" : selectStepTitle}
      onClick={handleGoBack}
      linkText={target ? `选择${typeNames[type] ?? type}` : "选择迁移方式"}
    />
  );

  return (
    <Modal
      close={close}
      className="migrate-instance-modal"
      onKeyDown={handleEscKey}
      aria-labelledby="migrate-title"
    >
      <header className="p-modal__header">
        <h2
          className="p-modal__title"
          key={type ? (target ? "confirm" : "select") : "start"}
          id="migrate-title"
        >
          {modalTitle}
        </h2>
        <button
          className="p-modal__close"
          aria-label="关闭窗口"
          onClick={close}
        >
          关闭
        </button>
      </header>
      {!type && (
        <div className="choose-migration-type">
          {isClustered && (
            <FormLink
              icon="cluster-host"
              title="将实例迁移到其他集群成员"
              onClick={() => {
                setType("cluster member");
              }}
            />
          )}
          <FormLink
            icon="switcher-dashboard"
            title="将实例根存储移动到其他存储池"
            onClick={() => {
              setType("root storage pool");
            }}
          />
          <FormLink
            icon="folder"
            title="将实例移动到其他项目"
            onClick={() => {
              setType("project");
            }}
          />
        </div>
      )}

      {type === "cluster member" && (
        <InstanceClusterMemberMigration
          instance={instance}
          onSelect={setTarget}
          targetMember={target}
          onCancel={handleGoBack}
          migrate={() => handleMigrate(target, "", "")}
        />
      )}

      {type === "root storage pool" && (
        <InstanceStoragePoolMigration
          instance={instance}
          onSelect={setTarget}
          targetPool={target}
          onCancel={handleGoBack}
          migrate={(targetMember) => handleMigrate(targetMember, target, "")}
        />
      )}

      {type === "project" && (
        <InstanceProjectMigration
          instance={instance}
          onSelect={setTarget}
          targetProject={target}
          onCancel={handleGoBack}
          migrate={() => handleMigrate("", "", target)}
        />
      )}
    </Modal>
  );
};

export default MigrateInstanceModal;
