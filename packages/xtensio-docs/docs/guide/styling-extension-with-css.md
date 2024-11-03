# Stying with CSS

Xtensio supports multiple ways of handling CSS, including:

1. [CSS/SCSS modules](#cssscss-modules)
2. [Global CSS](#global-css)

## CSS/SCSS modules

Xtensio has built-in support for CSS/CSS Modules using the `.module.(s)css` extension.

CSS Modules scope CSS locally by generating unique class names, allowing the same class names in different files without conflicts—ideal for component-level styling.

> Example using css modules in a popup

=== ":material-language-javascript: Javascript"

    ```ts title="/popup/popup.jsx" linenums="1" hl_lines="1 4"
    import styles from './popup.module.css'

    const PopupPage = () => {
      return <div className={styles.hugeText}>This is the extension popup</div>;
    };

    export default PopupPage;
    ```
    ```css title="/popup/popup.module.css" linenums="1"
    .hugeText {
        font-size: 32px;
    }
    ```

=== ":material-language-typescript: Typescript"

    ```ts title="/popup/popup.tsx" linenums="1" hl_lines="1 4"
    import styles from './popup.module.css'

    const PopupPage: React.FC = () => {
      return <div className={styles.hugeText}>This is the extension popup</div>;
    };

    export default PopupPage;
    ```
    ```css title="/popup/popup.module.css" linenums="1"
    .hugeText {
        font-size: 32px;
    }
    ```

## Global CSS

Any `.css` file imported at any location of the project is currently treated as global CSS.

> Example way of using global css

```js linenums="1"
import "./some-css-file.css";
// ...
```

And that' it! you've included some global CSS to your project
