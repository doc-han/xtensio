import React from "react";
import { ContentConfig } from "xtensio";

const Google: React.FC = () => {
    return <div>This is injected onto the google url specified below</div>
}

console.log("I'm on the google page. Check the console");

export default {
    matches: ["*//:*.google.com/*"],
    shadowRoot: true,
    component: Google
} as ContentConfig