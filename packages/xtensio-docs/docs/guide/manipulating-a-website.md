This is the heart ❤️ of browser extension development where most of the real magic happens.

The primary goal of a browser extension is to change the user experience of website or to supercharge the browser. This could mean changing the looks or adding some functionalities to websites. This type of manipulation is handled by content files in xtensio.

## How to use contents in xtensio

Every content file has two parts.

| Part                                                  | What it does                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------ |
| [:link:**`config`**](#how-to-define-a-content-config) | Defines where & how a specific code should be executed             |
| [:link:**`code`**](#how-to-define-code)               | Some code that is to be executed when conditions in config are met |

## How to define a content config

A content config is defined as an exported function with the name `getConfig` that returns an object.

> Below is an an example content config that runs only on google.com domains

=== ":material-language-javascript: Javascript"

    ```js title="/contents/google.jsx" linenums="1"
    export function getConfig() {
        return {
            matches: ["*://*.google.com/*"],
        };
    }
    ```

=== ":material-language-typescript: Typescript"

    ```ts title="/contents/google.tsx" linenums="1"
    import { ContentConfig } from "xtensio"

    export function getConfig(): ContentConfig {
        return {
            matches: ["*://*.google.com/*"],
        };
    }
    ```

## How to define code

The code to be executed when a content config is matched can be any form of javascript. DOM manipulation, or any kind of web acceptable javascript/typescript.

> Below is an example content file that print "This is google" whenever you're on google.

=== ":material-language-javascript: Javascript"

    ```js title="/contents/google.jsx" linenums="1" hl_lines="7"
    export function getConfig() {
        return {
            matches: ["*://*.google.com/*"],
        };
    }

    console.log("This is google")
    // you can have complex scripts here. even DOM manipulation
    ```

=== ":material-language-typescript: Typescript"

    ```ts title="/contents/google.tsx" linenums="1" hl_lines="9"
    import { ContentConfig } from "xtensio"

    export function getConfig(): ContentConfig {
        return {
            matches: ["*://*.google.com/*"],
        };
    }

    console.log("This is google")
    // you can have complex scripts here. even DOM manipulation
    ```

## Mounting UI into websites using React

With the use of [React.js](https://react.dev) you can mount React components on any website by just making the component the default export in the content file.

> An example content file that mounts UI into amazon.com using React

=== ":material-language-javascript: Javascript"

    ```js title="/contents/amazon.jsx" linenums="1" hl_lines="9 10 11 12 13 14"
    import { useState } from "react"

    export function getConfig() {
        return {
            matches: ["*://*.amazon.com/*"],
        };
    }

    const SomeComponent = () => {
        const [count, setCount] = useState(0);
        return <div onClick={()=> setCount(count+1)}>click to change {count}</div>
    }

    export default SomeComponent;
    ```

=== ":material-language-typescript: Typescript"

    ```ts title="/contents/amazon.tsx" linenums="1" hl_lines="10 11 12 13 14 15"
    import { useState } from "react"
    import { ContentConfig } from "xtensio"

    export function getConfig(): ContentConfig {
        return {
            matches: ["*://*.amazon.com/*"],
        };
    }

    const SomeComponent: React.FC = () => {
        const [count, setCount] = useState(0);
        return <div onClick={()=> setCount(count+1)}>click to change {count}</div>
    }

    export default SomeComponent;
    ```

You can now build awesome extensions that manipulate websites and provide tailored experiences for users ❤️.
