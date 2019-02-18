---
lang: en
title: 'Creating an Express Application with LoopBack REST API'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/express-with-lb4-rest-tutorial.html
summary: A simple Express application with LoopBack 4 REST API
---

## Overview

[Express](https://expressjs.com) is an unopinionated Node.js framework. LoopBack
REST API can be mounted to an Express application and be used as middleware.
This way the user can mix and match features from both frameworks to suit their
needs.

This tutorial assumes familiarity with scaffolding a LoopBack 4 application,
[`Models`](Model.md), [`DataSources`](DataSources.md),
[`Repositories`](Repositories.md), and [`Controllers`](Controllers.md). To see
how they're used in a LoopBack application, please see the
[`Todo` tutorial](todo-tutorial.md).

## Try it out

If you'd like to see the final results of this tutorial as an example
application, follow these steps:

1.  Run the `lb4 example` command to select and clone the express-composition
    repository:

    ```sh
    $ lb4 example
    ? What example would you like to clone? (Use arrow keys)
    todo: Tutorial example on how to build an application with LoopBack 4.
    todo-list: Continuation of the todo example using relations in LoopBack 4.
    hello-world: A simple hello-world Application using LoopBack 4.
    log-extension: An example extension project for LoopBack 4.
    rpc-server: A basic RPC server using a made-up protocol.
    > express-composition: A simple Express application that uses LoopBack 4 REST API.
    ```

2.  Switch to the directory.

    ```sh
    cd loopback4-example-express-composition
    ```

3.  Finally, start the application!

    ```sh
    $ npm start

    Server is running at http://127.0.0.1:3000
    ```

### Create your LoopBack Application

#### Scaffold your Application

Run `lb4 app` to scaffold your application and fill out the following prompts as
follows:

```sh
$ lb4 app
? Project name: Note
? Project description: An application for recording notes.
? Project root directory: (note)
? Application class name: (NoteApplication)
❯◉ Enable tslint: add a linter with pre-configured lint rules
 ◉ Enable prettier: add new npm scripts to facilitate consistent code formatting
 ◉ Enable mocha: install mocha to assist with running tests
 ◉ Enable loopbackBuild: use @loopback/build helpers (e.g. lb-tslint)
 ◉ Enable vscode: add VSCode config files
 ◉ Enable repositories: include repository imports and RepositoryMixin
 ◉ Enable services: include service-proxy imports and ServiceMixin
 # npm will install dependencies now
 Application note was created in note.
```

#### Add Note Model

Inside the project folder, run `lb4 model` to create the `Note` and fill out the
following prompts as follows:

```sh
$ cd note
$ lb4 model
? Model class name: note
? Please select the model base class: Entity (A persisted model with an ID)
? Allow additional (free-form) properties? No

Let's add a property to Note
Enter an empty property name when done

? Enter the property name: id
? Property type: number
? Is id the ID property? Yes
? Is it required?: No
? Default value [leave blank for none]:

Let's add another property to Note
Enter an empty property name when done

? Enter the property name: title
? Property type: string
? Is it required?: Yes
? Default value [leave blank for none]:

Let's add another property to Note
Enter an empty property name when done

? Enter the property name: content
? Property type: string
? Is it required?: No
? Default value [leave blank for none]:

Let's add another property to Note
Enter an empty property name when done

? Enter the property name:

   create src/models/note.model.ts
   update src/models/index.ts

Model note was created in src/models/
```

#### Add a DataSource

Now, let's create a simple in-memory datasource by running the `lb4 datasource`
command and filling out the prompts as follows:

```sh
$ lb4 datasource
? Datasource name: ds
? Select the connector for ds: In-memory db (supported by StrongLoop)
? window.localStorage key to use for persistence (browser only):
? Full path to file for persistence (server only): ./data/ds.json

  create src/datasources/ds.datasource.json
  create src/datasources/ds.datasource.ts
  update src/datasources/index.ts

Datasource ds was created in src/datasources/
```

Similar to the `Todo` example, let's create the `ds.json` by creating a data
folder at the application's root.

```sh
$ mkdir data
$ touch data/ds.json
```

Then copy and paste the following into the `ds.json` file:

```json
{
  "ids": {
    "Note": 3
  },
  "models": {
    "Note": {
      "1": "{\"title\":\"Things I need to buy\",\"content\":\"milk, cereal, and waffles\",\"id\":1}",
      "2": "{\"title\":\"Great frameworks\",\"content\":\"LoopBack is a great framework\",\"id\":2}"
    }
  }
}
```

#### Add Note Repository

To create the repository, run the `lb4 repository` command and choose the
`DsDataSource` and `Note` model, as follows:

```sh
$ lb4 repository
? Please select the datasource DsDatasource
? Select the model(s) you want to generate a repository Note
   create src/repositories/note.repository.ts
   update src/repositories/index.ts

Repository Note was created in src/repositories/
```

#### Add Note Controller

To complete the `Note` application, create a controller using the
`lb4 controller` command and the following prompts:

```sh
$ lb4 controller
? Controller class name: note
? What kind of controller would you like to generate? REST Controller with CRUD functions
? What is the name of the model to use with this CRUD repository? Note
? What is the name of your CRUD repository? NoteRepository
? What is the type of your ID? number
? What is the base HTTP path name of the CRUD operations? /notes
   create src/controllers/note.controller.ts
   update src/controllers/index.ts

Controller note was created in src/controllers/
```

### Express Class

Create a new file **src/server.ts** to create your Express class:

```sh
npm install --save express
npm install --save-dev @types/express
```

{% include code-caption.html content="src/server.ts" %}

```ts
import * as express from 'express';

export class ExpressApplication {
  constructor() {}
}
```

Create two properties, the Express application instance and LoopBack application
instance:

```ts
import {NoteApplication} from './application';
import {ApplicationConfig} from '@loopback/core';
import * as express from 'express';

export class ExpressApplication {
  private app: express.Application;
  private lbApp: NoteApplication;

  constructor(options: ApplicationConfig = {}) {
    this.app = express();
    this.lbApp = new NoteApplication(options);
  }
}
```

Now, inside the constructor, we're going to add the basepath and expose the
front-end assets via Express:

```ts
this.lbApp.basePath('/api');
this.app.use('/api', this.lbApp.requestHandler);
```

Then, we can add some custom Express routes, as follows:

```ts
import {Request, Response} from 'express';
import * as path from 'path';

export class ExpressApplication {
  private app: express.Application;
  private lbApp: NoteApplication;

  constructor(options: ApplicationConfig = {}) {
  // earlier code

  // Custom Express routes
  this.app.get('/', function(_req: Request, res: Response) {
    res.sendFile(path.resolve('public/express.html'));
  });
  this.app.get('/hello', function(_req: Request, res: Response) {
    res.send('Hello world!');
  });
}
```

Finally, we can add functions to boot the `Note` application and start the
Express application:

```sh
npm install --save p-event
```

```ts
import * as pEvent from 'p-event';

export class ExpressApplication {
  private app: express.Application;
  private lbApp: NoteApplication;

  constructor(options: ApplicationConfig = {}) {
    //...
  }

  async boot() {
    await this.lbApp.boot();
  }

  async start() {
    const server = this.app.listen(3000);
    await pEvent(server, 'listening');
  }
}
```

[This](https://github.com/strongloop/loopback-next/blob/master/examples/express-composition/src/server.ts)
is what your final `server.ts` file should look like.

Then, we can modify our **src/index.ts** file to start the application:

{% include code-caption.html content="src/index.ts" %}

```ts
import {ExpressServer} from './server';
import {ApplicationConfig} from '@loopback/core';

export {ExpressServer};

export async function main(options: ApplicationConfig = {}) {
  const server = new ExpressServer(options);
  await server.boot();
  await server.start();
  console.log('Server is running at http://localhost:3000');
}
```

Now let's start the application and visit <http://localhost:3000>:

```sh
npm start

Server is running at http://localhost:3000
```

If we go to the [Explorer](http://localhost:3000/api/explorer), we can make
requests for our LoopBack application. Notice how the server is
<http://localhost:3000/api>.

To view our custom `/hello` Express route, go to <http://localhost:3000/hello>
and you should see 'Hello world!'.

As a bonus, you can add another custom Express route to a static file that will
display your Notes in a table format:

```ts
this.app.get('/notes', function(_req: Request, res: Response) {
  res.sendFile(path.resolve('public/notes.html'));
});
```

And add the following
[public/notes.html](https://github.com/strongloop/loopback-next/blob/master/examples/express-composition/public/notes.html)
file to your project, run `npm start` again, and visit
<http://localhost:3000/notes>.

Congratulations, you just mounted LoopBack 4 REST API onto a simple Express
application.
