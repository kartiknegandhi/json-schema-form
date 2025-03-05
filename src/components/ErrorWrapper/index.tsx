import { HDSTooltip } from "@here/hds-react-components";
import React, { ReactNode } from "react";

import "./index.scss";

interface TooltipWrapperI {
  children: ReactNode;
  errors: string[];
}

function ErrorWrapper({ children, errors = [] }: TooltipWrapperI) {
  return (
    <HDSTooltip
      position="right"
      trigger="keyup focus"
      disabled={errors.length === 0}
      content={
        <ul className="errorTooltip">
          {errors?.map((error: any, index: number) => {
            return (
              <li key={index}>
                <span className="point danger"></span>
                <span className="danger-text">{error}</span>
              </li>
            );
          })}
        </ul>
      }
    >
      {children}
    </HDSTooltip>
  );
}

export default ErrorWrapper;
