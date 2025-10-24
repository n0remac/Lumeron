/// <reference types="next" />
/// <reference types="next/image-types/global" />

// CSS module declarations
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

// Allow side-effect imports of CSS files
declare module '*.css' {
  const content: void;
  export default content;
}
