import React, { ComponentType } from 'react';
import {
  useParams,
  useNavigate,
  useLocation,
  NavigateFunction,
  Location,
  Params,
} from 'react-router-dom';

export interface RouterProps {
  router: {
    params: Params;
    navigate: NavigateFunction;
    location: Location;
  };
  match: {
    params: Params;
  };
}

// HOC to provide router v6 hooks to class components
export function withRouter<P extends object>(
  Component: ComponentType<P & RouterProps>
): ComponentType<Omit<P, keyof RouterProps>> {
  return function ComponentWithRouterProp(props: Omit<P, keyof RouterProps>) {
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    return (
      <Component
        {...(props as P)}
        router={{ params, navigate, location }}
        // Also provide legacy match prop for easier migration
        match={{ params }}
      />
    );
  };
}
