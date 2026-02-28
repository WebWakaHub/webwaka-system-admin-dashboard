# Getting Started with the WebWaka API

**Objective:** This guide will walk you through the process of creating a WebWaka account and making your first API request.

## Creating a WebWaka Account

Before you can start using the WebWaka API, you need to create a developer account. Follow these steps to get started:

1.  **Visit the WebWaka Developer Portal:** Open your web browser and navigate to [https://developers.webwaka.com](https://developers.webwaka.com).
2.  **Sign Up for an Account:** Click the "Sign Up" button and fill out the registration form. You will need to provide your name, email address, and a password.
3.  **Verify Your Email Address:** After you submit the registration form, you will receive an email with a verification link. Click the link to verify your email address and activate your account.

## Your First API Request

Now that you have a WebWaka account, you can make your first API request. In this example, we will retrieve your user information.

### 1. Get Your API Key

First, you need to get your API key from the WebWaka Developer Portal. Your API key is a unique identifier that authenticates your requests to the API.

1.  **Log in to the Developer Portal:** Go to [https://developers.webwaka.com](https://developers.webwaka.com) and log in to your account.
2.  **Navigate to the API Keys Page:** Click on the "API Keys" link in the navigation menu.
3.  **Copy Your API Key:** Your API key will be displayed on this page. Copy the key to your clipboard.

### 2. Make the API Request

Now you can use your API key to make a request to the WebWaka API. We will use the `curl` command-line tool to make the request.

Open your terminal and run the following command, replacing `YOUR_API_KEY` with the API key you copied from the Developer Portal:

```bash
curl -X GET https://api.webwaka.com/v1/me \
     -H "Authorization: Bearer YOUR_API_KEY"
```

### 3. View the Response

If your request is successful, you will receive a JSON response containing your user information:

```json
{
  "id": "123",
  "name": "Your Name",
  "email": "your.email@example.com"
}
```

Congratulations! You have successfully made your first API request to the WebWaka API.
