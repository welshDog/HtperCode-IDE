# HyperCode IDE Architecture

## Project Structure

```
hypercode-ide/
├── packages/
│   ├── core/                # HyperCode-V1 (Core logic/foundation)
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── compiler/            # HYPERcode-V2 (Language specs/compiler)
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── ide/                 # HtperCode-IDE (Main application)
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── README.md
│
├── .gitmodules              # Git submodule configuration
├── package.json             # Workspace root config
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 16+
- Git
- Yarn (recommended) or npm

### Initial Setup

1. **Initialize the workspace**
   ```bash
   # Create workspace directory
   mkdir hypercode-ide && cd hypercode-ide
   
   # Initialize git
   git init
   
   # Add submodules
   git submodule add https://github.com/welshDog/HyperCode-V1.git packages/core
   git submodule add https://github.com/welshDog/HYPERcode-V2.git packages/compiler
   
   # Create IDE package
   mkdir -p packages/ide
   ```

2. **Configure Workspace**
   Create a root `package.json`:
   ```json
   {
     "name": "hypercode-ide",
     "private": true,
     "workspaces": [
       "packages/*"
     ],
     "scripts": {
       "build": "yarn workspaces run build",
       "dev": "yarn workspace @hypercode/ide dev",
       "test": "yarn workspaces run test",
       "clean": "rm -rf node_modules && yarn workspaces run clean"
     }
   }
   ```

3. **Configure IDE Package**
   In `packages/ide/package.json`:
   ```json
   {
     "name": "@hypercode/ide",
     "version": "1.0.0",
     "private": true,
     "dependencies": {
       "@hypercode/compiler": "workspace:*",
       "@hypercode/core": "workspace:*"
     },
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start"
     }
   }
   ```

## Development Workflow

1. **Start Development**
   ```bash
   # Install dependencies
   yarn install
   
   # Start development server
   yarn dev
   ```

2. **Building**
   ```bash
   # Build all packages
   yarn build
   
   # Build specific package
   yarn workspace @hypercode/core build
   ```

## Deployment

### Production Build
```bash
yarn build
```

### Docker (Optional)
```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app
COPY . .

RUN yarn install --frozen-lockfile
RUN yarn build

CMD ["yarn", "start"]
```

## CI/CD Pipeline

Example GitHub Actions workflow (`.github/workflows/ci.yml`):

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          submodules: 'recursive'
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      
      - name: Run tests
        run: yarn test
      
      - name: Build
        run: yarn build
```

## Best Practices

1. **Versioning**
   - Use semantic versioning for all packages
   - Update dependents when breaking changes occur

2. **Dependencies**
   - Keep shared dependencies at the root level
   - Use workspace protocol (`workspace:*`) for internal dependencies

3. **Code Organization**
   - Keep package interfaces clean and well-documented
   - Use TypeScript for type safety across packages
   - Share types between packages using a shared types package if needed

4. **Testing**
   - Write unit tests for core functionality
   - Add integration tests for cross-package features
   - Use a consistent testing framework (Jest recommended)

## Troubleshooting

### Submodule Issues
If submodules aren't updating:
```bash
git submodule update --init --recursive
```

### Dependency Conflicts
If you encounter dependency conflicts:
1. Delete `node_modules` and lock files
2. Run `yarn install`

## License
MIT
