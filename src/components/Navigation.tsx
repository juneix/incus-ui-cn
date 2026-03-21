import type { FC, MouseEvent } from "react";
import { useEffect, useState } from "react";
import {
  Button,
  Icon,
  isDarkTheme,
  loadTheme,
  SideNavigationItem,
  Step,
  Stepper,
  useListener,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "context/auth";
import classnames from "classnames";
import Logo from "./Logo";
import ProjectSelector from "pages/projects/ProjectSelector";
import {
  capitalizeFirstLetter,
  getElementAbsoluteHeight,
  logout,
} from "util/helpers";
import { useCurrentProject } from "context/useCurrentProject";
import { useMenuCollapsed } from "context/menuCollapsed";
import NavLink from "components/NavLink";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import type { AccordionNavMenu } from "./NavAccordion";
import NavAccordion from "./NavAccordion";
import type { Location } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { isIncusOS } from "api/os";
import { useLoggedInUser } from "context/useLoggedInUser";
import { useSettings } from "context/useSettings";
import type { LxdProject } from "types/project";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useIsClustered } from "context/useIsClustered";
import { getReportBugURL } from "util/reportBug";
import { queryKeys } from "util/queryKeys";
import DocLink from "components/DocLink";

const initialiseOpenNavMenus = (location: Location) => {
  const openPermissions = location.pathname.includes("/permissions/");
  const openStorage = location.pathname.includes("/storage/");
  const openNetwork = location.pathname.includes("/network");
  const openCluster = location.pathname.includes("/cluster/");
  const initialOpenMenus: AccordionNavMenu[] = [];
  if (openPermissions) {
    initialOpenMenus.push("permissions");
  }

  if (openStorage) {
    initialOpenMenus.push("storage");
  }

  if (openNetwork) {
    initialOpenMenus.push("networking");
  }

  if (openCluster) {
    initialOpenMenus.push("clustering");
  }

  return initialOpenMenus;
};

const ALL_PROJECTS = "所有项目";

const initializeProjectName = (
  isAllProjectsFromUrl: boolean,
  isLoading: boolean,
  project: LxdProject | undefined,
) => {
  if (isAllProjectsFromUrl) {
    return ALL_PROJECTS;
  }

  if (project && !isLoading) {
    return project.name;
  }

  return "default";
};

const Navigation: FC = () => {
  const { isRestricted, isOidc } = useAuth();
  const { menuCollapsed, setMenuCollapsed } = useMenuCollapsed();
  const {
    project,
    isAllProjects: isAllProjectsFromUrl,
    canViewProject,
    isLoading,
  } = useCurrentProject();
  const isSmallScreen = useIsScreenBelow();
  const [projectName, setProjectName] = useState(
    initializeProjectName(isAllProjectsFromUrl, isLoading, project),
  );
  const isAllProjects = projectName === ALL_PROJECTS;
  const { hasCustomVolumeIso, hasAccessManagement } = useSupportedFeatures();
  const { loggedInUserName, loggedInUserID, authMethod } = useLoggedInUser();
  const [scroll, setScroll] = useState(false);
  const location = useLocation();
  const [openNavMenus, setOpenNavMenus] = useState<AccordionNavMenu[]>(() =>
    initialiseOpenNavMenus(location),
  );
  const onGenerate = location.pathname.includes("certificate-generate");
  const onTrustToken = location.pathname.includes("certificate-add");
  const { data: settings } = useSettings();
  const hasOidc = settings?.auth_methods?.includes("oidc");
  const navigate = useNavigate();
  const isClustered = useIsClustered();

  const { data: isRunningIncusOS = false } = useQuery({
    queryKey: [queryKeys.osCheck],
    queryFn: async () => isIncusOS(),
  });

  useEffect(() => {
    const isAllProjects = isAllProjectsFromUrl || !canViewProject;
    if (isAllProjects && projectName !== ALL_PROJECTS) {
      setProjectName(ALL_PROJECTS);
      setOpenNavMenus([]);
      return;
    }

    if (project && project.name !== projectName) {
      setProjectName(project.name);
    }
  }, [project?.name, isAllProjectsFromUrl, projectName]);

  useEffect(() => {
    if (!menuCollapsed) {
      adjustNavigationScrollForOverflow();
      return;
    }

    if (scroll && !menuCollapsed) {
      setScroll(false);
    }
  }, [menuCollapsed, scroll, openNavMenus]);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    adjustNavigationScrollForOverflow();
  }, [
    openNavMenus,
    isAuthenticated,
    loggedInUserID,
    loggedInUserName,
    authMethod,
  ]);

  const softToggleMenu = () => {
    if (isSmallScreen) {
      setMenuCollapsed((prev) => !prev);
    }
  };

  const hardToggleMenu = (e: MouseEvent<HTMLElement>) => {
    setMenuCollapsed((prev) => !prev);
    e.stopPropagation();
  };

  const adjustNavigationScrollForOverflow = () => {
    const navHeader = document.querySelector(".l-navigation .p-panel__header");
    const navTop = document.querySelector(".l-navigation .p-panel__content");
    const navBottom = document.querySelector(
      ".l-navigation .sidenav-bottom-container",
    );
    const navHeaderHeight = getElementAbsoluteHeight(navHeader as HTMLElement);
    const navTopHeight = getElementAbsoluteHeight(navTop as HTMLElement);
    const navBottomHeight = getElementAbsoluteHeight(navBottom as HTMLElement);

    const totalNavHeight = navHeaderHeight + navTopHeight + navBottomHeight;

    const isNavigationPanelOverflow = totalNavHeight >= window.innerHeight;

    const targetNavTopHeight =
      window.innerHeight - navHeaderHeight - navBottomHeight;

    if (isNavigationPanelOverflow) {
      const style = `height: ${targetNavTopHeight}px`;
      navTop?.setAttribute("style", style);
      setScroll(true);
    } else {
      const style = `height: auto`;
      navTop?.setAttribute("style", style);
      setScroll(false);
    }
  };

  const toggleAccordionNav = (feature: AccordionNavMenu) => {
    if (menuCollapsed) {
      setMenuCollapsed(false);
    }

    const newOpenMenus = openNavMenus.includes(feature)
      ? openNavMenus.filter((navMenu) => navMenu !== feature)
      : [...openNavMenus, feature];

    setOpenNavMenus(newOpenMenus);
  };

  useListener(window, adjustNavigationScrollForOverflow, "resize", true);

  const getNavTitle = (title: string) => {
    if (isAllProjects) {
      return `选择项目以查看${title}`;
    }

    return `${capitalizeFirstLetter(title)}（${projectName}）`;
  };

  const isDark = isAuthenticated || isDarkTheme(loadTheme());
  const isLight = !isDark;

  return (
    <>
      <header className="l-navigation-bar">
        <div
          className={classnames("p-panel", {
            "is-light": isLight,
            "is-dark": isDark,
          })}
        >
          <div className="p-panel__header">
            <Logo light={isLight} />
            <div className="p-panel__controls">
              <Button
                dense
                className="p-panel__toggle"
                onClick={hardToggleMenu}
              >
                菜单
              </Button>
            </div>
          </div>
        </div>
      </header>
      <nav
        aria-label="主导航"
        className={classnames("l-navigation", {
          "is-collapsed": menuCollapsed,
          "is-pinned": !menuCollapsed,
          "is-scroll": scroll,
        })}
      >
        <div className="l-navigation__drawer">
          <div
            className={classnames("p-panel", {
              "is-light": isLight,
              "is-dark": isDark,
            })}
          >
            <div className="p-panel__header is-sticky">
              <Logo light={isLight} />
              <div className="p-panel__controls u-hide--medium u-hide--large">
                <Button
                  appearance="base"
                  hasIcon
                  className="u-no-margin"
                  aria-label="关闭导航"
                  onClick={hardToggleMenu}
                >
                  <Icon name="close" />
                </Button>
              </div>
            </div>
            <div className="p-panel__content">
              <div
                className={classnames(
                  "p-side-navigation--icons sidenav-top-container",
                  { "is-light": isLight },
                )}
              >
                <ul className="p-side-navigation__list sidenav-top-ul">
                  {isAuthenticated && (
                    <>
                      <li
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <ProjectSelector
                          key={location.pathname}
                          activeProject={projectName}
                        />
                      </li>
                      <SideNavigationItem>
                        <NavLink
                          to={
                            isAllProjects
                              ? "/ui/all-projects/instances"
                              : `/ui/project/${encodeURIComponent(projectName)}/instances`
                          }
                          title={`实例（${projectName}）`}
                          onClick={softToggleMenu}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="pods"
                          />{" "}
                          实例
                        </NavLink>
                      </SideNavigationItem>
                      <SideNavigationItem>
                        <NavLink
                          to={`/ui/project/${encodeURIComponent(projectName)}/profiles`}
                          title={getNavTitle("配置模板")}
                          disabled={isAllProjects}
                          onClick={softToggleMenu}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="repository"
                          />{" "}
                          配置模板
                        </NavLink>
                      </SideNavigationItem>

                      <SideNavigationItem>
                        <NavAccordion
                          baseUrl={`/ui/project/${encodeURIComponent(projectName)}/network`}
                          title={getNavTitle("网络")}
                          disabled={isAllProjects}
                          iconName="exposed"
                          label="网络"
                          onOpen={() => {
                            toggleAccordionNav("networking");
                          }}
                          open={openNavMenus.includes("networking")}
                        >
                          {[
                            <SideNavigationItem
                              key={`/ui/project/${encodeURIComponent(projectName)}/networks`}
                            >
                              <NavLink
                                to={`/ui/project/${encodeURIComponent(projectName)}/networks`}
                                title={`网络（${projectName}）`}
                                onClick={softToggleMenu}
                                className="accordion-nav-secondary"
                                ignoreUrlMatches={[
                                  "network-acl",
                                  "network-acls",
                                  "network-ipam",
                                ]}
                              >
                                网络
                              </NavLink>
                            </SideNavigationItem>,
                            <SideNavigationItem
                              key={`/ui/project/${encodeURIComponent(projectName)}/network-acls`}
                            >
                              <NavLink
                                to={`/ui/project/${encodeURIComponent(projectName)}/network-acls`}
                                title={`ACL（${projectName}）`}
                                onClick={softToggleMenu}
                                className="accordion-nav-secondary"
                              >
                                ACL
                              </NavLink>
                            </SideNavigationItem>,
                            <SideNavigationItem
                              key={`/ui/project/${encodeURIComponent(projectName)}/network-ipam`}
                            >
                              <NavLink
                                to={`/ui/project/${encodeURIComponent(projectName)}/network-ipam`}
                                title={`IPAM（${projectName}）`}
                                onClick={softToggleMenu}
                                className="accordion-nav-secondary"
                              >
                                IPAM
                              </NavLink>
                            </SideNavigationItem>,
                          ]}
                        </NavAccordion>
                      </SideNavigationItem>
                      <SideNavigationItem>
                        <NavAccordion
                          baseUrl={`/ui/project/${encodeURIComponent(projectName)}/storage`}
                          title={getNavTitle("存储")}
                          disabled={isAllProjects}
                          iconName="switcher-dashboard"
                          label="存储"
                          onOpen={() => {
                            toggleAccordionNav("storage");
                          }}
                          open={openNavMenus.includes("storage")}
                        >
                          {[
                            <SideNavigationItem
                              key={`/ui/project/${encodeURIComponent(projectName)}/storage/pools`}
                            >
                              <NavLink
                                to={`/ui/project/${encodeURIComponent(projectName)}/storage/pools`}
                                title="存储池"
                                onClick={softToggleMenu}
                                className="accordion-nav-secondary"
                                ignoreUrlMatches={[
                                  "volumes/custom",
                                  "/bucket/",
                                ]}
                              >
                                存储池
                              </NavLink>
                            </SideNavigationItem>,
                            <SideNavigationItem
                              key={`/ui/project/${encodeURIComponent(projectName)}/storage/volumes`}
                            >
                              <NavLink
                                to={`/ui/project/${encodeURIComponent(projectName)}/storage/volumes`}
                                title="存储卷"
                                onClick={softToggleMenu}
                                className="accordion-nav-secondary"
                                activeUrlMatches={["volumes/custom"]}
                              >
                                存储卷
                              </NavLink>
                            </SideNavigationItem>,
                            ...(hasCustomVolumeIso
                              ? [
                                  <SideNavigationItem
                                    key={`/ui/project/${encodeURIComponent(projectName)}/storage/custom-isos`}
                                  >
                                    <NavLink
                                      to={`/ui/project/${encodeURIComponent(projectName)}/storage/custom-isos`}
                                      title="自定义 ISO"
                                      onClick={softToggleMenu}
                                      className="accordion-nav-secondary"
                                    >
                                      自定义 ISO
                                    </NavLink>
                                  </SideNavigationItem>,
                                ]
                              : []),
                            <SideNavigationItem
                              key={`/ui/project/${encodeURIComponent(projectName)}/storage/buckets`}
                            >
                              <NavLink
                                to={`/ui/project/${encodeURIComponent(projectName)}/storage/buckets`}
                                title="存储桶"
                                onClick={softToggleMenu}
                                className="accordion-nav-secondary"
                                activeUrlMatches={["/bucket/"]}
                              >
                                存储桶
                              </NavLink>
                            </SideNavigationItem>,
                          ]}
                        </NavAccordion>
                      </SideNavigationItem>
                      <SideNavigationItem>
                        <NavLink
                          to={`/ui/project/${encodeURIComponent(projectName)}/images`}
                          title={getNavTitle("镜像")}
                          disabled={isAllProjects}
                          onClick={softToggleMenu}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="image"
                          />{" "}
                          镜像
                        </NavLink>
                      </SideNavigationItem>
                      <SideNavigationItem>
                        <NavLink
                          to={`/ui/project/${encodeURIComponent(projectName)}/configuration`}
                          title={getNavTitle("配置")}
                          disabled={isAllProjects}
                          onClick={softToggleMenu}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="switcher-environments"
                          />{" "}
                          配置
                        </NavLink>
                      </SideNavigationItem>
                      <hr
                        className={classnames("navigation-hr", {
                          "is-light": isLight,
                        })}
                      />
                      {isClustered && (
                        <SideNavigationItem>
                          <NavAccordion
                            baseUrl="/ui/cluster"
                            title={getNavTitle("集群")}
                            iconName="cluster-host"
                            label="集群"
                            onOpen={() => {
                              toggleAccordionNav("clustering");
                            }}
                            open={openNavMenus.includes("clustering")}
                          >
                            {[
                              <SideNavigationItem key="members">
                                <NavLink
                                  to="/ui/cluster/members"
                                  title="成员"
                                  onClick={softToggleMenu}
                                  className="accordion-nav-secondary"
                                >
                                  成员
                                </NavLink>
                              </SideNavigationItem>,
                              <SideNavigationItem key="groups">
                                <NavLink
                                  to="/ui/cluster/groups"
                                  title="分组"
                                  onClick={softToggleMenu}
                                  className="accordion-nav-secondary"
                                >
                                  分组
                                </NavLink>
                              </SideNavigationItem>,
                            ]}
                          </NavAccordion>
                        </SideNavigationItem>
                      )}
                      {!isClustered && (
                        <SideNavigationItem>
                          <NavLink
                            to="/ui/server"
                            title="服务器"
                            onClick={softToggleMenu}
                          >
                            <Icon
                              className="is-light p-side-navigation__icon"
                              name="cluster-host"
                            />{" "}
                            服务器
                          </NavLink>
                        </SideNavigationItem>
                      )}
                      <SideNavigationItem>
                        <NavLink
                          to={`/ui/operations`}
                          title={`操作（${projectName}）`}
                          onClick={softToggleMenu}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="status"
                          />{" "}
                          操作
                        </NavLink>
                      </SideNavigationItem>
                      {!isRestricted && (
                        <SideNavigationItem>
                          <NavLink
                            to="/ui/warnings?status=new"
                            title="警告"
                            onClick={softToggleMenu}
                          >
                            <Icon
                              className="is-light p-side-navigation__icon"
                              name="warning-grey"
                            />{" "}
                            警告
                          </NavLink>
                        </SideNavigationItem>
                      )}
                      {hasAccessManagement && (
                        <SideNavigationItem>
                          <NavAccordion
                            baseUrl="/ui/permissions"
                            title="权限"
                            iconName="user"
                            label="权限"
                            onOpen={() => {
                              toggleAccordionNav("permissions");
                            }}
                            open={openNavMenus.includes("permissions")}
                          >
                            {[
                              <SideNavigationItem key="/ui/permissions/identities">
                                <NavLink
                                  to="/ui/permissions/identities?system-identities=hide"
                                  title="身份"
                                  onClick={softToggleMenu}
                                  activeUrlMatches={[
                                    "/ui/permissions/identities",
                                  ]}
                                  className="accordion-nav-secondary"
                                >
                                  身份
                                </NavLink>
                              </SideNavigationItem>,
                              <SideNavigationItem key="/ui/permissions/groups">
                                <NavLink
                                  to="/ui/permissions/groups"
                                  title="分组"
                                  onClick={softToggleMenu}
                                  className="accordion-nav-secondary"
                                >
                                  分组
                                </NavLink>
                              </SideNavigationItem>,
                              <SideNavigationItem key="/ui/permissions/idp-groups">
                                <NavLink
                                  to="/ui/permissions/idp-groups"
                                  title="身份提供方分组"
                                  onClick={softToggleMenu}
                                  className="accordion-nav-secondary"
                                >
                                  IDP 分组
                                </NavLink>
                              </SideNavigationItem>,
                            ]}
                          </NavAccordion>
                        </SideNavigationItem>
                      )}
                      <SideNavigationItem>
                        <NavLink
                          to="/ui/settings"
                          title="设置"
                          onClick={softToggleMenu}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="settings"
                          />{" "}
                          设置
                        </NavLink>
                      </SideNavigationItem>
                    </>
                  )}
                  {isAuthenticated && isRunningIncusOS && (
                    <>
                      <hr
                        className={classnames("navigation-hr", {
                          "is-light": isLight,
                        })}
                      />
                      <SideNavigationItem>
                        <NavLink
                          to="/ui/os"
                          title="操作系统"
                          onClick={softToggleMenu}
                          ignoreUrlMatches={["operations"]}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="desktop"
                          />{" "}
                          操作系统
                        </NavLink>
                      </SideNavigationItem>
                    </>
                  )}
                  {!isAuthenticated && (onGenerate || onTrustToken) && (
                    <div
                      className={classnames("login-navigation", {
                        "is-collapsed": menuCollapsed,
                      })}
                    >
                      {hasOidc && !menuCollapsed && (
                        <a
                          className="p-button has-icon sso-login-button"
                          href="/oidc/login"
                        >
                          <Icon name="security" />
                          <span>改为使用 SSO 登录</span>
                        </a>
                      )}
                      <Stepper
                        steps={[
                          <Step
                            key="Step 1"
                            handleClick={() => {
                              navigate("/ui/login/certificate-generate");
                            }}
                            index={1}
                            title="浏览器证书"
                            hasProgressLine={false}
                            enabled
                            iconName="number"
                            selected={onGenerate}
                            iconClassName="stepper-icon"
                          />,
                          <Step
                            key="Step 2"
                            handleClick={() => {
                              navigate("/ui/login/certificate-add");
                            }}
                            index={2}
                            title="身份认证 Token"
                            hasProgressLine={false}
                            enabled
                            iconName="number"
                            selected={onTrustToken}
                          />,
                        ]}
                      />
                    </div>
                  )}
                </ul>
              </div>
              <div
                className={classnames(
                  "p-side-navigation--icons sidenav-bottom-container",
                  { "is-light": isLight },
                )}
              >
                <ul
                  className={classnames(
                    "p-side-navigation__list sidenav-bottom-ul",
                    {
                      "authenticated-nav": isAuthenticated,
                    },
                  )}
                >
                  <hr
                    className={classnames("navigation-hr", {
                      "is-light": isLight,
                    })}
                  />
                  {isAuthenticated && (
                    <SideNavigationItem>
                      <div
                        className="p-side-navigation__link"
                        title={`${loggedInUserName}`}
                      >
                        {authMethod == "tls" ? (
                          <Icon
                            className="p-side-navigation__icon is-dark"
                            name="lock-locked"
                          />
                        ) : authMethod == "oidc" ? (
                          <Icon
                            className="p-side-navigation__icon is-dark"
                            name="profile"
                          />
                        ) : authMethod == "unix" ? (
                          <Icon
                            className="p-side-navigation__icon is-dark"
                            name="profile"
                          />
                        ) : (
                          <></>
                        )}
                        <div className="u-truncate">{loggedInUserName}</div>
                      </div>
                    </SideNavigationItem>
                  )}
                  <SideNavigationItem>
                    <DocLink
                      className="p-side-navigation__link"
                      title="文档中心"
                      docPath="/"
                    >
                      <Icon
                        className={classnames("p-side-navigation__icon", {
                          "is-light": isAuthenticated,
                        })}
                        name="book"
                      />
                      文档中心
                    </DocLink>
                  </SideNavigationItem>
                  <SideNavigationItem>
                    <a
                      className="p-side-navigation__link"
                      href="https://qm.qq.com/q/ZzOD5Qbhce"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="交流反馈"
                    >
                      <Icon
                        className={classnames("p-side-navigation__icon", {
                          "is-light": isAuthenticated,
                        })}
                        name="user-group"
                      />
                      交流反馈*
                    </a>
                  </SideNavigationItem>
                  <SideNavigationItem>
                    <a
                      className="p-side-navigation__link"
                      href="https://5nav.eu.org/power/"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="打赏鼓励"
                    >
                      <Icon
                        className={classnames("p-side-navigation__icon", {
                          "is-light": isAuthenticated,
                        })}
                        name="plans"
                      />
                      打赏鼓励*
                    </a>
                  </SideNavigationItem>
                  {isOidc && (
                    <SideNavigationItem>
                      <a
                        className="p-side-navigation__link"
                        title="退出登录"
                        onClick={() => {
                          logout();

                          softToggleMenu();
                        }}
                      >
                        <Icon
                          className="is-light p-side-navigation__icon p-side-logout"
                          name="export"
                        />
                        退出登录
                      </a>
                    </SideNavigationItem>
                  )}
                </ul>
                <div
                  className={classnames("sidenav-toggle-wrapper", {
                    "authenticated-nav": isAuthenticated,
                    "is-light": isLight,
                  })}
                >
                  <Button
                    appearance="base"
                    aria-label={`${
                      menuCollapsed ? "展开" : "折叠"
                    }主导航`}
                    hasIcon
                    dense
                    className={classnames(
                      "sidenav-toggle u-no-margin l-navigation-collapse-toggle u-hide--small",
                      { "is-light": isLight },
                    )}
                    onClick={hardToggleMenu}
                  >
                    <Icon
                      name="sidebar-toggle"
                      className={classnames({ "is-light": isLight })}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
