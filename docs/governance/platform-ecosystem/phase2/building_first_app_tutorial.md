_# Building Your First Application with the WebWaka API

**Objective:** This tutorial will guide you through the process of building a simple web application that interacts with the WebWaka API.

## Prerequisites

Before you begin, make sure you have the following installed:

*   **Node.js and npm:** You can download and install Node.js from [https://nodejs.org/](https://nodejs.org/).
*   **A text editor:** We recommend using a modern text editor like Visual Studio Code.

## Scaffolding Your Application

We will use the `create-react-app` command-line tool to quickly set up a new React application.

1.  **Open your terminal and run the following command:**

    ```bash
    npx create-react-app webwaka-app
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd webwaka-app
    ```

## Connecting to the WebWaka API

Now, let's connect our application to the WebWaka API. We will use the `axios` library to make HTTP requests.

1.  **Install axios:**

    ```bash
    npm install axios
    ```

2.  **Create a new file called `api.js` in the `src` directory and add the following code:**

    ```javascript
    import axios from 'axios';

    const apiClient = axios.create({
      baseURL: 'https://api.webwaka.com/v1',
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_WEBWAKA_API_KEY}`
      }
    });

    export default apiClient;
    ```

3.  **Create a `.env` file in the root of your project and add your API key:**

    ```
    REACT_APP_WEBWAKA_API_KEY=YOUR_API_KEY
    ```

    Replace `YOUR_API_KEY` with your actual API key from the WebWaka Developer Portal.

## Displaying Data

Now, let's display some data from the WebWaka API in our application.

1.  **Open the `src/App.js` file and replace its contents with the following code:**

    ```javascript
    import React, { useState, useEffect } from 'react';
    import apiClient from './api';

    function App() {
      const [user, setUser] = useState(null);

      useEffect(() => {
        const fetchUser = async () => {
          try {
            const response = await apiClient.get('/me');
            setUser(response.data);
          } catch (error) {
            console.error('Error fetching user:', error);
          }
        };

        fetchUser();
      }, []);

      return (
        <div className="App">
          <header className="App-header">
            <h1>WebWaka API</h1>
            {user ? (
              <div>
                <p>ID: {user.id}</p>
                <p>Name: {user.name}</p>
                <p>Email: {user.email}</p>
              </div>
            ) : (
              <p>Loading user...</p>
            )}
          </header>
        </div>
      );
    }

    export default App;
    ```

2.  **Start the development server:**

    ```bash
    npm start
    ```

Your application should now be running at [http://localhost:3000](http://localhost:3000) and should display your user information from the WebWaka API.
_
