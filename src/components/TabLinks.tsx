import type { FC } from "react";
import { Tabs, useNotify } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { slugify } from "util/slugify";
import type { TabLink } from "@canonical/react-components/dist/components/Tabs/Tabs";

interface LocalTab {
  label: string;
  path?: string;
}

interface Props {
  tabs: (string | TabLink | LocalTab)[];
  activeTab?: string;
  tabUrl: string;
}

const TabLinks: FC<Props> = ({ tabs, activeTab, tabUrl }) => {
  const notify = useNotify();
  const navigate = useNavigate();

  return (
    <Tabs
      links={tabs.map((tab) => {
        if (typeof tab !== "string" && !("path" in tab)) {
          return tab;
        }

        const label = typeof tab === "string" ? tab : tab.label;
        const tabPath =
          typeof tab === "string" ? slugify(tab) : (tab.path ?? slugify(tab.label));
        const isDefaultTab = tab === tabs[0];
        const href = isDefaultTab ? tabUrl : `${tabUrl}/${tabPath}`;

        return {
          label,
          id: tabPath,
          active: tabPath === activeTab || (isDefaultTab && !activeTab),
          onClick: (e) => {
            e.preventDefault();
            notify.clear();
            navigate(href);
          },
          href,
        };
      })}
    />
  );
};

export default TabLinks;
