Xtensio does support environment variables out of the box.

Create any of the below env files at the root of your project and keep some environment variables in them.

| Type        | Filename                      | Description                                         |
| ----------- | ----------------------------- | --------------------------------------------------- |
| Global      | `.env`                        | used for **both development and production builds** |
| Development | `.dev.env` `.development.env` | used for **only development**                       |
| Production  | `.prod.env` `.production.env` | used for **only production builds**                 |

Hence, you can have the development version of a variable in `.dev.env` and the production version of it in `.prod.env` and xtensio will know what to use when.

> Note: Development is when you run `yarn dev` or `npm run dev` and Production is when you run `yarn build` or `npm run build`
