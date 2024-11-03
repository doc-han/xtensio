## What are Extension Pages?

Think of extension pages as webpages that are hosted by your extension. Hence, these pages are only available once a user has your extension installed.

## What are they for?

Extension Pages can be used to create configuration or settings pages, Terms of Service pages, and similar things you'll like to dedicate a page for.

## How to create an Extension Page

1. Create a `.jsx` or `.tsx` file in the `pages` directory.
2. Write a React component
3. Export this component as the default export

> An example settings page

=== ":material-language-javascript: Javascript"

    ```ts title="/pages/settings.jsx" linenums="1" hl_lines="18"
    import { useState } from "react"

    const SettingsPage = () => {
      const [theme, setTheme] = useState("light");

      const themeChangeHandler = (e)=> {
        setTheme(e.target.name);
      }

      return <>
        <div>Select theme:</div>
        <input value={theme} type="radio" name="light" onChange={themeChangeHandler} />
        <input value={theme} type="radio" name="dark" onChange={themeChangeHandler} />
      </>
    };

    // default export a react component to have a page
    export default SettingsPage;
    ```

=== ":material-language-typescript: Typescript"

    ```ts title="/pages/settings.tsx" linenums="1" hl_lines="18"
    import { useState } from "react"

    const SettingsPage: React.FC = () => {
      const [theme, setTheme] = useState("light");

      const themeChangeHandler = (e: React.ChangeEvent<HTMLInputElement>)=> {
        setTheme(e.target.name);
      }

      return <>
        <div>Select theme:</div>
        <input value={theme} type="radio" name="light" onChange={themeChangeHandler} />
        <input value={theme} type="radio" name="dark" onChange={themeChangeHandler} />
      </>
    };

    // default export a react component to have a page
    export default SettingsPage;
    ```

## How to navigate to an Extension Page

After creating an extension page, you should be able to navigate to it from anywhere in the extension. xtensio provides a utility function `visitPage` for that.

To visit a page, just call `visitPage` with the name of the page without the file extension.

> How to visit a page that was created at `/pages/settings.tsx`

```ts title="somewhere-in-your-extension" linenums="1"
import { visitPage } from "xtensio"
...
visitPage("settings");
...
```

That's all you need to navigate to an Extension Page you've created in your extension.
