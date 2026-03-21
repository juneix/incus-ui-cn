import type { FC } from "react";
import { Button } from "@canonical/react-components";

interface Props {
  totalCount: number;
  filteredNames: string[];
  itemName: string;
  parentName?: string;
  selectedNames: string[];
  setSelectedNames: (val: string[]) => void;
  hideActions?: boolean;
}

const SelectedTableNotification: FC<Props> = ({
  totalCount,
  filteredNames,
  itemName,
  parentName,
  selectedNames,
  setSelectedNames,
  hideActions,
}: Props) => {
  const isAllSelected = selectedNames.length === filteredNames.length;

  const selectAll = () => {
    setSelectedNames(filteredNames);
  };

  const selectNone = () => {
    setSelectedNames([]);
  };

  return (
    <div>
      {isAllSelected ? (
        <>
          <>
            共 <b>{filteredNames.length}</b> 个{itemName}
          </>
          {!hideActions && (
            <Button
              appearance="link"
              className="u-no-margin--bottom u-no-padding--top"
              onClick={selectNone}
            >
              取消
            </Button>
          )}
        </>
      ) : (
        <>
          已选择 <b>{selectedNames.length}</b> 个{itemName}{" "}
          {!hideActions && (
            <Button
              appearance="link"
              className="u-no-margin--bottom u-no-padding--top"
              onClick={selectAll}
            >
              选择全部 <b>{filteredNames.length}</b> 个
              {filteredNames.length === totalCount
                ? `${itemName}${parentName ? `（${parentName}）` : ""}`
                : `已筛选的${itemName}`}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default SelectedTableNotification;
