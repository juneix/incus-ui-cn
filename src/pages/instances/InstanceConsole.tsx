import type { FC } from "react";
import { useEffect, useState, useRef } from "react";
import {
  ActionButton,
  Button,
  ContextualMenu,
  EmptyState,
  Icon,
  Notification,
  RadioInput,
  useNotify,
} from "@canonical/react-components";
import InstanceGraphicConsole from "./InstanceGraphicConsole";
import type { LxdInstance } from "types/instance";
import { LxdOperation } from "types/operation";
import InstanceTextConsole from "./InstanceTextConsole";
import { useInstanceStart } from "util/instanceStart";
import { sendKey } from "lib/spice/src/inputs.js";
import { KeyNames } from "lib/spice/src/atKeynames.js";
import AttachIsoBtn from "pages/instances/actions/AttachIsoBtn";
import NotificationRow from "components/NotificationRow";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useInstanceEntitlements } from "util/entitlements/instances";
import { isInstanceRunning } from "util/instanceStatus";
import { useOperations } from "context/operationsProvider";
import { getInstanceName, getProjectName, findOperation } from "util/operations";

interface Props {
  instance: LxdInstance;
}

const InstanceConsole: FC<Props> = ({ instance }) => {
  const notify = useNotify();
  const isVm = instance.type === "virtual-machine";
  const [isGraphic, setGraphic] = useState(isVm);
  const { hasCustomVolumeIso } = useSupportedFeatures();
  const { canUpdateInstanceState, canAccessInstanceConsole } =
    useInstanceEntitlements();

  const isRunning = isInstanceRunning(instance);

  const [attemptConnection, setAttemptConnection] = useState(isRunning);
  const { operations, isFetching } = useOperations();
  const lastOp = useRef({"restart": "", "start": "", "stop":""});
  const [showConnectBtn, setShowConnectBtn] = useState(false);

  const onFailure = (title: string, e: unknown, message?: string) => {
    notify.failure(title, e, message);
    setShowConnectBtn(true);
    setAttemptConnection(false);
  };

  const showNotRunningInfo = () => {
    notify.info(
      "请先启动实例，再使用文本控制台。",
      "实例未运行",
    );
  };

  let handleFullScreen = () => {
    /**/
  };

  const handleConnection = () => {
    setShowConnectBtn(false);
    setAttemptConnection(true);
  };

  const onChildMount = (childHandleFullScreen: () => void) => {
    handleFullScreen = childHandleFullScreen;
  };

  const setGraphicConsole = (isGraphic: boolean) => {
    notify.clear();
    setGraphic(isGraphic);
    setShowConnectBtn(false);
    setAttemptConnection(true);
  };

  const { handleStart, isLoading } = useInstanceStart(instance);

  if (!canAccessInstanceConsole(instance)) {
    return (
      <Notification severity="caution" title="权限受限">
        你没有访问此实例控制台的权限。
      </Notification>
    );
  }

  useEffect(() => {
    // Check if there are any relevant instance operations.
    let restartOp = findOperation(instance, operations, "Restarting instance");

    if (restartOp) {
      if (restartOp.status == "Success" && lastOp.current["restart"] != restartOp.created_at && attemptConnection) {
        // Reconnect console if restart operation was detected.
        lastOp.current["restart"] = restartOp.created_at;
        setAttemptConnection(false);
        setTimeout(() => {setAttemptConnection(true);}, 2000);
      }
    }

    let startOp = findOperation(instance, operations, "Starting instance");
    if (startOp) {
      // Disconect console if start operation was detected.
      setAttemptConnection(false);
      if (lastOp.current["start"] != startOp.created_at && startOp.status == "Success") {
        setShowConnectBtn(true);
        lastOp.current["start"] = startOp.created_at;
      }
    }

    let stopOp = findOperation(instance, operations, "Stopping instance");
    if (stopOp) {
      // Disconect console if stop operation was detected.
      setAttemptConnection(false);
      if (stopOp.status == "Success" && lastOp.current["stop"] != stopOp.created_at) {
        setShowConnectBtn(false);
        lastOp.current["stop"] = stopOp.created_at;
      }
    }
  }, [operations, attemptConnection, showConnectBtn]);

  return (
    <div className="instance-console-tab">
      {!isVm && (
        <div className="p-panel__controls">
            {isRunning && showConnectBtn && <Button
              className="u-no-margin--bottom control-button"
              hasIcon
              onClick={() => handleConnection()}
              >
                <Icon name="connected" />
                <span>重新连接</span>
              </Button>}
        </div>
      )}
      {isVm && (
        <div className="p-panel__controls">
          <div className="console-radio-wrapper">
            <RadioInput
              labelClassName="right-margin"
              label="图形"
              checked={isGraphic}
              onChange={() => {
                setGraphicConsole(true);
              }}
            />
            <RadioInput
              label="文本控制台"
              checked={!isGraphic}
              onChange={() => {
                setGraphicConsole(false);
              }}
            />
          </div>
          {isRunning && (
            <div>
              {showConnectBtn && <Button
              className="u-no-margin--bottom"
              hasIcon
              onClick={() => handleConnection()}
              >
                <Icon name="connected" />
                <span>重新连接</span>
              </Button>}
              {isGraphic && hasCustomVolumeIso && <AttachIsoBtn instance={instance} />}
              {isGraphic &&
              <Button
                className="u-no-margin--bottom"
                onClick={() => {
                  handleFullScreen();
                }}
              >
                <span>全屏</span>
              </Button>}
              {isGraphic &&
              <ContextualMenu
                hasToggleIcon
                toggleLabel="快捷键"
                toggleClassName="u-no-margin--bottom"
                links={[
                  {
                    children: "发送 Ctrl + Alt + Del",
                    onClick: () => {
                      sendKey(window.spice_connection, KeyNames.KEY_KP_Decimal, [ KeyNames.KEY_LCtrl, KeyNames.KEY_Alt ]);
                    },
                  },
                  {
                    children: "发送 Alt + TAB",
                    onClick: () => {
                      sendKey(window.spice_connection, KeyNames.KEY_Tab, [ KeyNames.KEY_Alt ]);
                    },
                  },
                  {
                    children: "发送 Alt + F4",
                    onClick: () => {
                      sendKey(window.spice_connection, KeyNames.KEY_F4, [ KeyNames.KEY_Alt]);
                    },
                  },
                  {
                    children: "发送 Ctrl + Alt + F1",
                    onClick: () => {
                      sendKey(window.spice_connection, KeyNames.KEY_F1, [ KeyNames.KEY_LCtrl, KeyNames.KEY_Alt ]);
                    },
                  },
                  {
                    children: "发送 Ctrl + Alt + F2",
                    onClick: () => {
                      sendKey(window.spice_connection, KeyNames.KEY_F2, [ KeyNames.KEY_LCtrl, KeyNames.KEY_Alt]);
                    },
                  },
                  {
                    children: "发送 Ctrl + Alt + F3",
                    onClick: () => {
                      sendKey(window.spice_connection, KeyNames.KEY_F3, [ KeyNames.KEY_LCtrl, KeyNames.KEY_Alt]);
                    },
                  },
                  {
                    children: "发送 Ctrl + Alt + F4",
                    onClick: () => {
                      sendKey(window.spice_connection, KeyNames.KEY_F4, [ KeyNames.KEY_LCtrl, KeyNames.KEY_Alt]);
                    },
                  },
                ]}
              />}
            </div>
          )}
        </div>
      )}
      <NotificationRow />
      {isGraphic && !isRunning && (
        <EmptyState
          className="empty-state"
          image={<Icon name="pods" className="empty-state-icon" />}
          title="实例已停止"
        >
          <p>启动实例后即可访问图形控制台。</p>
          <ActionButton
            appearance="positive"
            loading={isLoading}
            aria-disabled={isLoading}
            onClick={handleStart}
            disabled={!canUpdateInstanceState(instance) || isLoading}
            title={
              canUpdateInstanceState(instance)
                ? ""
                : "你没有启动此实例的权限。"
            }
          >
            启动实例
          </ActionButton>
        </EmptyState>
      )}
      {isGraphic && attemptConnection && (
        <div className="spice-wrapper">
          <InstanceGraphicConsole
            instance={instance}
            onMount={onChildMount}
            onFailure={onFailure}
          />
        </div>
      )}
      {!isGraphic && attemptConnection && (
        <InstanceTextConsole
          instance={instance}
          onFailure={onFailure}
          showNotRunningInfo={showNotRunningInfo}
        />
      )}
    </div>
  );
};

export default InstanceConsole;
