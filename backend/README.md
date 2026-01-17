Production-ready Node.js + Express API with Prisma ORM and PostgreSQL.

## Features

- ✅ RESTful API for dashboards and templates
- ✅ PostgreSQL database with Prisma ORM
- ✅ Docker support with docker-compose
- ✅ CORS enabled
- ✅ Error handling middleware
- ✅ Database seeding
- ✅ Environment-based configuration

## Quick Start with Docker

\`\`\`bash
# Clone the repository
git clone <your-repo>
cd dashboard-backend

# Copy environment variables
cp .env.example .env

# Build and start containers
docker-compose up --build
\`\`\`

The API will be available at \`http://localhost:4000\`

## Local Development

\`\`\`bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start development server
npm run dev
\`\`\`

## API Endpoints

### Dashboards
- \`GET /api/dashboards\` - Get all dashboards
- \`GET /api/dashboards/:id\` - Get single dashboard
- \`POST /api/dashboards\` - Create dashboard
- \`PUT /api/dashboards/:id\` - Update dashboard
- \`DELETE /api/dashboards/:id\` - Delete dashboard

### Templates
- \`GET /api/templates\` - Get all templates
- \`GET /api/templates/:id\` - Get single template
- \`GET /api/templates?category=business\` - Filter by category

### Health Check
- \`GET /health\` - API health status

## Environment Variables

\`\`\`env
DATABASE_URL="postgresql://user:password@host:5432/database"
PORT=4000
NODE_ENV=production
CORS_ORIGIN="*"
\`\`\`

## Docker Commands

\`\`\`bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up --build

# Remove volumes (reset database)
docker-compose down -v
\`\`\`

## Database Commands

\`\`\`bash
# Generate Prisma Client
npm run db:generate

# Create migration
npm run db:migrate

# Push schema changes
npm run db:push

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Reset database
npm run db:reset
\`\`\`

## Project Structure

\`\`\`
backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
├── routes/
│   ├── dashboards.js
│   └── templates.js
├── middleware/
│   └── errorHandler.js
├── config/
│   └── dashboardTemplates.js
├── server.js
├── package.json
├── Dockerfile
├── docker-compose.yml
└── .env.example
\`\`\`

## License

MIT`
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Folder className="text-blue-400" size={32} />
            Backend Project Structure
          </h1>
          <p className="text-gray-400">
            Complete Node.js + Express + Prisma + PostgreSQL backend
          </p>
        </div>

        {copiedFile && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400">✓ Copied {copiedFile} to clipboard</p>
          </div>
        )}

        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📁 File Tree</h2>
          <div className="font-mono text-sm">
            <FileNode name="backend" type="folder" />
            <FileNode name="server.js" type="file" content={files['server.js']} onCopy={setCopiedFile} />
            <FileNode name="package.json" type="file" content={files['package.json']} onCopy={setCopiedFile} />
            <FileNode name="Dockerfile" type="file" content={files['Dockerfile']} onCopy={setCopiedFile} />
            <FileNode name="docker-compose.yml" type="file" content={files['docker-compose.yml']} onCopy={setCopiedFile} />
            <FileNode name=".env.example" type="file" content={files['.env.example']} onCopy={setCopiedFile} />
            <FileNode name=".dockerignore" type="file" content={files['.dockerignore']} onCopy={setCopiedFile} />
            <FileNode name="README.md" type="file" content={files['README.md']} onCopy={setCopiedFile} />
            
            <FileNode name="prisma" type="folder" />
            <FileNode name="schema.prisma" type="file" content={files['prisma/schema.prisma']} onCopy={setCopiedFile} />
            
            <FileNode name="routes" type="folder" />
            <FileNode name="dashboards.js" type="file" content={files['routes/dashboards.js']} onCopy={setCopiedFile} />
            <FileNode name="templates.js" type="file" content={files['routes/templates.js']} onCopy={setCopiedFile} />
            
            <FileNode name="middleware" type="folder" />
            <FileNode name="errorHandler.js" type="file" content={files['middleware/errorHandler.js']} onCopy={setCopiedFile} />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🚀 Quick Start</h2>
          <div className="space-y-4">
            <div className="bg-slate-900 rounded p-4">
              <p className="text-sm text-gray-400 mb-2">1. Copy all files to your backend folder</p>
              <p className="text-sm text-gray-400 mb-2">2. Run Docker Compose:</p>
              <code className="block bg-black/30 p-3 rounded text-green-400 font-mono text-sm">
                docker-compose up --build
              </code>
            </div>
            
            <div className="bg-slate-900 rounded p-4">
              <p className="text-sm text-gray-400 mb-2">3. API will be available at:</p>
              <code className="block bg-black/30 p-3 rounded text-blue-400 font-mono text-sm">
                http://localhost:4000
              </code>
            </div>

            <div className="bg-slate-900 rounded p-4">
              <p className="text-sm text-gray-400 mb-2">4. Update frontend API URL if needed</p>
              <code className="block bg-black/30 p-3 rounded text-yellow-400 font-mono text-sm">
                http://localhost:4000/api/templates
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
