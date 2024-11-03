# Styling with Tailwind CSS

To include tailwind class utilities, you basically need to Opt in `[ select 'Yes' ]` for Tailwind Css in the setup process.
We will do the all the heavy lifting and that's it! you can start using tailwind utility classes in any section being page,content, popup etc.

```sh linenums="1" title="> Terminal" hl_lines="5"
✔ What's the name of your project? … app-name
✔ Choose preferred package manager … npm / yarn
✔ Do you want an src folder? … yes/no
✔ Do you want to use Typescript? … yes/no
✔ Do you want to use Tailwind Css? … yes
```

> An example use of Tailwind in popup

=== ":material-language-javascript: Javascript"

    ```ts title="/popup/popup.jsx" linenums="1" hl_lines="3"
    const PopupPage = () => {
      return <div
                className="px-10 py-1 bg-red-200 border ...">
             This is the extension popup
             </div>;
    };

    export default PopupPage;
    ```

=== ":material-language-typescript: Typescript"

    ```ts title="/popup/popup.tsx" linenums="1" hl_lines="3"
    const PopupPage: React.FC = () => {
      return <div
                className="px-10 py-1 bg-red-200 border ...">
             This is the extension popup
             </div>;
    };

    export default PopupPage;
    ```

## Setting up Tailwind for already existing Projects.

coming soon.
