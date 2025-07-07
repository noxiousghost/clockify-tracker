# Clockify Tracker CLI

## About

This is a simple command-line interface (CLI) tool designed to help you track your time using Clockify. It allows you to start, stop, and check the status of your time entries directly from your terminal.

## Installation

To get started with the Clockify Tracker CLI, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd clockify-tracker
    ```

2.  **Install dependencies:**
    ```bash
    yarn install
    ```

## Configuration

### Clockify API Key

To connect to your Clockify account, you need to provide your API key. Create a `.env` file in the root directory of the project and add your Clockify API key:

```
CLOCKIFY_API_KEY="your_actual_clockify_api_key"
```

Replace `"your_actual_clockify_api_key"` with your personal API key from your Clockify profile settings.

### Local Projects Filtering

The CLI allows you to filter the projects displayed when starting a new time entry. On the first run of the `start` command, the application will fetch all your Clockify projects and populate `config/local-projects.json` with their IDs and names. You can then edit this file to keep only the projects you frequently work on.

Example `config/local-projects.json`:

```json
[
  {
    "id": "671b783fbd91bc5e5ddcb944",
    "name": "2024 Project Management Traineeship"
  },
  {
    "id": "another_project_id",
    "name": "Another Project Name"
  }
]
```

Remove any project objects (both `id` and `name`) that you don't want to appear in the project selection list.

## Usage

### Build the application

Before running, you need to compile the TypeScript code:

```bash
yarn build
```

### Run the application

Once built, you can run the CLI commands using `yarn clock start`:

- **Start a new time entry:**

  ```bash
  yarn clock start
  ```

  This will prompt you to select a project from your curated list.

- **Stop the currently running time entry:**

  ```bash
  yarn clock stop
  ```

- **Check the status of the current timer:**
  ```bash
  yarn clock status
  ```
