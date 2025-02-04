# Agent Demo

A React-based demo application built with Vite and TypeScript.

## Prerequisites

- Node.js 20.x
- npm
- Docker (optional, for containerized deployment)

## Getting Started

### Environment Setup

1. Clone the repository
2. Copy the environment example file to create your own:
   ```bash
   cp env.example .env
   ```
3. Configure the following environment variables in your `.env` file:
   - `VITE_API_URL`: Your API URL (default: https://api.nimblebrain.ai)
   - `VITE_AGENT_ID`: Your agent ID
   - `VITE_API_KEY`: Your API key

### Installation

Install dependencies:

```bash
npm ci
```

### Development

Start the development server:

```bash
npm start
```

The application will be available at `http://localhost:4000`.

### Build

Create a production build:

```bash
npm run build
```

### Linting

Run ESLint:

```bash
npm run lint
```

## Docker Deployment

### Building the Docker Image

```bash
docker build \
  --build-arg API_URL=your_api_url \
  --build-arg AGENT_ID=your_agent_id \
  --build-arg API_KEY=your_api_key \
  -t agent-demo .
```

### Running the Container

```bash
docker run -p 4000:4000 agent-demo
```

The application will be accessible at `http://localhost:4000`.

## Scripts

- `npm start`: Start development server
- `npm run build`: Create production build
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build locally

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please reach out to our team at support@nimblebrain.ai
