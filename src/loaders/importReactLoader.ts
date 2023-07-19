export default function importReactLoader(source: string) {
  return `
import React from "react";
${source}
`;
}
