# Chat Application

### Technologies Used

ReactJS, Vite, Tailwind CSS, React Router & Socket.IO, Drizzle ORM (PostgreSQL), Redis, JWT Token Authentication

### Description

This is the frontend (client) for a chatting application using websockets. It implements realtime messages with [Socket.IO](https://socket.io/), database persistence using Drizzle ORM to save to a PostgreSQL database. Users can signup and login via user and password with securely stored and hashed passwords. Users can see a list of all available chatrooms to send messages to other users, as well as send messages to individual users and view their profiles.

This project is still a work in progress and obly available locally, but I do plan on hosting it publically once it is more complete.

Some of the interesting features of this application are as follows...

-   **_Lazy loading messages and infinite scrolling_**

    Messages are loaded in batches as the user scrolls through the chatroom to reduce total data usage and reduce server load.

-   **_JWT Protected API Routes_**

    Many of the API routes require JWT Authentication tokens for senstitive actions and ensure the authorized user is performing the action.

    -   **_Active User Counts via Redis_**
