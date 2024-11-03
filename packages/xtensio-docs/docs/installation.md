System Requirements:

- Node.js 20.x or later.

## Creating a new project

To create a new extension project using xtensio, we recommend using the create-xtensio-app utility, which sets up everything for you. To create a project, run:

=== ":simple-yarn: YARN"

    ``` sh title="> Terminal"
    yarn create xtensio-app
    ```

=== ":material-npm: NPM"

    ``` sh title="> Terminal"
    npx create-xtensio-app
    ```

On installation you'll see the following prompts.

```sh linenums="1" title="> Terminal"
✔ What's the name of your project? … app-name
✔ Choose preferred package manager … npm / yarn
✔ Do you want an src folder? … yes/no
✔ Do you want to use Typescript? … yes/no
✔ Do you want to use Tailwind Css? … yes/no
```

After a successful run of the prompts, a folder will be created your app-name and all required dependencies will be installed.

> If you're new to xtensio, see the [project structure](/project-structure) docs for an overview of all the possible files and folders in your application.
