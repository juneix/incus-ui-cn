import type { FC } from "react";
import { Button, CustomLayout, Icon, Spinner } from "@canonical/react-components";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "context/auth";
import { useSettings } from "context/useSettings";

const Login: FC = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const { data: settings } = useSettings();
  const hasOidc = settings?.auth_methods?.includes("oidc");
  const hasSSOOnly = settings?.config?.["user.ui.sso_only"] == "true";

  if (isAuthLoading) {
    return <Spinner className="u-loader" text="正在加载资源..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/ui" replace={true} />;
  }

  return (
    <>
      <CustomLayout>
        <div className="empty-state login-page">
          <h1 className="p-heading--4 u-sv-2">登录</h1>

          <>
            {!hasSSOOnly && (
            <p className="u-sv1">选择登录方式</p>
            )}
            <div className="auth-container">
              {hasOidc && (
                <a className="p-button--positive has-icon" href="/oidc/login">
                  <Icon name="security" light />
                  <span>使用 SSO 登录</span>
                </a>
              )}
              {!hasSSOOnly && (
              <>
                <Link
                  className="has-icon p-button"
                  to="/ui/login/certificate-generate"
                >
                  <Icon name="certificate" />
                  <span>使用 TLS 证书登录</span>
                </Link>
              </>
              )}
            </div>
          </>
        </div>
      </CustomLayout>
    </>
  );
};

export default Login;
