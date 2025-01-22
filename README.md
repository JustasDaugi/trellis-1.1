## Description

A full-stack application project management application inspired by Trello.

### Key Features

* Create and share boards with others

* Organize your daily tasks with lists

* Create and customize cards for lists

* Create and modify cards and lists on shared boards

* Re-use prepared templates

* And more!


## Setup

1. `npm install`
2. Create a PostgreSQL database (or use an existing one).
3. Setup `.env` file in `server` based on `.env.example` file.
4. Run migrations with `npm run migrate:latest`.

## Tests

```bash

# back end tests with an in-memory database
npm test -w server
```

## Running the project in development

```bash
# automatically restarts the server
npm run dev -w server

```

## Running the project in production


Server:

```bash
npm run build -w server
npm run start -w server
```
