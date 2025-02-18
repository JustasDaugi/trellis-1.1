# Trellis-1.1

## Overview

trellis-1.1 is a project management application that allows users to create and manage boards, lists, and cards efficiently. With collaboration features, real-time activity logging, and user authentication and authorization, this application is designed to make teamwork easier.

**Disclaimer**: This project is a continuation of the previous capstone project.
Project link: https://github.com/JustasDaugi/trellis

## Table of Contents

- [Features](#features)
  - [Board Management](#board-management)
  - [List Management](#list-management)
  - [Card Management](#card-management)
  - [Collaboration](#collaboration)
  - [Activity Logging](#activity-logging)
  - [User Authentication & Security](#user-authentication--security)
- [Tech Stack](#tech-stack)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Testing](#testing)
- [Installation](#installation)

## Features

### Board features
- **Creation & Customization**
  - Create boards with customizable backgrounds.
  - Update board names.
- **Sharing & Deletion**
  - Share boards via Gmail.
  - View shared boards on the homepage.

### List features
  - Create new lists.
  - Add or remove lists if you are the creator on a shared board

### Card features
- **Creation & Editing**
  - Create cards.
  - Add or remove cards if you are the creator on a shared board.
- **Due Dates & Descriptions**
  - Add or remove due dates.
  - Add or remove card descriptions.
  - Integration with Google Calendar to add events.

### Collaboration
- **Ownership & Membership**
  - Board owners can share and collaborate on boards with other users.
  - Board owners have the ability to remove board members.
  - Collaborators can leave boards.

### Activity Logging
- **Real-time Tracking**
  - Log all list and card creations or updates.
  - View detailed activity logs via the "View activity" option in the Board dropdown.
  - Logs include action types and associated entities (e.g., <user> <action> on list or card).
- **Notifications**
  - For instant notifications, activity updates are pushed to a Slack channel.

### User Authentication & Security
- **Password Management**
  - Password reset functionality using JWT tokens with a 15-minute expiry.
  - Enforced password strength requirements.

## Tech Stack

### Frontend
- **Vue.js**
- **Flowbite**

### Backend
- **Express/tRPC**: Express with RPC-based communication.
- **Zod**: Used for runtime and compile-time schema validation.
- **Kysely**: Manages database initialization and migrations.
- **PostgreSQL**: Main relational database for storing relational application data.
- **MongoDB**: Stored logs for user activity as documents.
- **Redis**: Cached query results to reduce frequency of database queries from PostgreSQL (e.g., finding all user owned boards).
- **Socket.io**: Delivers real-time notifications over a WebSocket connection - updating the client-side for new activity notifications.

### Testing
- **Vitest**
- **Playwright**


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

## Project retrospective
Link: https://docs.google.com/document/d/1MeZlNdtFmxfleUAkCUxbyh-ZJJHZTWSN/edit?usp=sharing&ouid=102069400217498636336&rtpof=true&sd=true
