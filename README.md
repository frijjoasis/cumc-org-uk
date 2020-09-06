Welcome to the CUMC website (cumc.org.uk) code repo.<br />
In future, the prod server will be setup as a `git remote`, so be careful with your commits.<br />
\- Edmund

## Setup
You will need to run

### `cd client && npm install` (o.e.)
and
### `cd server && npm install` (o.e.)
to install the required dependencies.
You should also create a `.env` in `/server` with the following variables:

- `PORT` The port the express server should run on (default: 5000)
- `DATABASE_URL` The PostgreSQL URL for storing backend data
- `SECRET` The secret used to sign session cookies. Locally, I have this set to `oxfordsucks`. Obviously, this is not a secret; in production this should be randomly generated and sufficiently complex
- `CLIENT_ID`, `CLIENT_SECRET` OAuth2 client credentials. These can be obtained from the Google API project page

## Available Scripts

In the root directory, you can run:

### `cd client && npm start` (o.e.)

Runs the React app in development mode.<br />
You will also need to run

### `cd server && npm start` (o.e.)

in a new terminal to start the express server (defaults to port 5000). The port should be set via a `.env` variable.
I recommend using a Run profile in the IDE of your choice to do this all for you.<br />

Open [http://localhost:3000](http://localhost:3000) to view the website in your browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.