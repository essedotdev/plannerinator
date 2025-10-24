/**
 * Type declarations for react-syntax-highlighter/dist/esm/light
 *
 * The official @types/react-syntax-highlighter package doesn't include
 * types for the /dist/esm/light path, which is the recommended way to
 * use the library with Next.js to avoid webpack resolution issues.
 *
 * Using the main export causes webpack to try resolving ALL variants
 * (including Prism which depends on refractor), causing build failures.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "react-syntax-highlighter/dist/esm/light" {
  import { Component } from "react";

  export interface SyntaxHighlighterProps {
    language?: string;
    style?: Record<string, React.CSSProperties>;
    children: string | string[];
    customStyle?: React.CSSProperties;
    codeTagProps?: React.HTMLProps<HTMLElement>;
    useInlineStyles?: boolean;
    showLineNumbers?: boolean;
    startingLineNumber?: number;
    lineNumberStyle?: React.CSSProperties | ((lineNumber: number) => React.CSSProperties);
    wrapLines?: boolean;
    lineProps?:
      | React.HTMLProps<HTMLElement>
      | ((lineNumber: number) => React.HTMLProps<HTMLElement>);
    renderer?: (props: {
      rows: any[];
      stylesheet: any;
      useInlineStyles: boolean;
    }) => React.ReactNode;
    PreTag?: React.ComponentType<any> | string;
    CodeTag?: React.ComponentType<any> | string;
    [key: string]: any;
  }

  export default class SyntaxHighlighter extends Component<SyntaxHighlighterProps> {
    static registerLanguage(name: string, func: any): void;
  }
}

declare module "react-syntax-highlighter/dist/esm/styles/hljs" {
  export const atomOneDark: any;
  export const atomOneLight: any;
  export const githubGist: any;
  export const monokai: any;
  export const vs: any;
  export const vs2015: any;
}

declare module "react-syntax-highlighter/dist/esm/languages/hljs/*" {
  const language: any;
  export default language;
}
