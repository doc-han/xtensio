The extension popup is the small UI that shows up when you click an extension icon. [see what it looks like](#popup_image)

Inside the popup folder is a file :material-language-javascript: `popup.jsx` (or :material-language-typescript: `popup.tsx` depending on what you're using) which exports a React component. This is the single entry point for your extension popup.

=== ":material-language-typescript: Javascript"

    ```js title="/popup/popup.jsx" linenums="1"
    const PopupPage = () => {
      return <div>This is the extension popup</div>;
    };

    export default PopupPage;
    ```

=== ":material-language-typescript: Typescript"

    ```ts title="/popup/popup.tsx" linenums="1"
    const PopupPage: React.FC = () => {
      return <div>This is the extension popup</div>;
    };

    export default PopupPage;
    ```

There's no limit to what you can do here. you can import other components and do awesome stuff.

## What does it look like?

like this!

<figure markdown="span" id="popup_image">
  ![A browser extension popup](/assets/extension-popup-image.png){ width="80%" }
  <figcaption>A browser extension popup</figcaption>
</figure>
