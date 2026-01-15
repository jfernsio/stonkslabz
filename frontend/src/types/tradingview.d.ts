import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "tv-ticker-tape": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        symbols?: string;
        "show-hover"?: boolean;
      };
    }
  }
}

export {};
