import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  Spinner,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOSStorage, updateOSStorage } from "api/os";
import NotificationRow from "components/NotificationRow";
import OSYamlEditor from "components/forms/OSYamlEditor";
import type { YamlFormValues } from "components/forms/YamlForm";
import { queryKeys } from "util/queryKeys";
import { yamlToObject } from "util/yaml";

interface Props {
  target: string;
}

const OSStorage: FC<Props> = ({ target }) => {
  const toastNotify = useToastNotification();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [editorKey, setEditorKey] = useState(0);

  const {
    data: storageData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [queryKeys.osStorage, target],
    queryFn: async () => fetchOSStorage(target),
  });

  useEffect(() => {
    setEditorKey((k) => k + 1);
  }, [target]);

  const onSubmit = (
    values: YamlFormValues,
    handleSuccess: () => void,
    handleFailure: () => void,
  ) => {
    updateOSStorage(
      JSON.stringify({ config: yamlToObject(values.yaml) }),
      target,
    )
      .then(() => {
        toastNotify.success(<>存储配置已更新</>);
        queryClient.invalidateQueries({
          queryKey: [queryKeys.osStorage, target],
        });
        handleSuccess();
      })
      .catch((e) => {
        toastNotify.failure("存储配置更新失败", e);
        handleFailure();
      });
  };

  if (error) {
    notify.failure("加载存储数据失败", error);
  }

  return (
    <>
      <NotificationRow />
      {isLoading && (
        <Spinner className="u-loader" text="正在加载存储数据..." />
      )}
      {!isLoading && !error && (
        <OSYamlEditor
          key={editorKey}
          yamlData={storageData}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};

export default OSStorage;
