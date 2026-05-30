import app from './app';
import prisma from './utils/prisma';

const PORT = process.env.PORT || 5000;

async function start() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('Database: connected');
    } catch (err) {
        console.error('\nDatabase: FAILED to connect');
        console.error(publicDbHint(err));
        console.error('API will start but auth and data routes will return 500 until this is fixed.\n');
    }

    app.listen(PORT, () => {
        console.log(`
  ╔══════════════════════════════════╗
  ║   VendAIX API  —  Port ${PORT}     ║
  ║   Status: RUNNING                ║
  ╚══════════════════════════════════╝
  `);
    });
}

function publicDbHint(err: unknown): string {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('db:5432') || msg.includes("Can't reach database server")) {
        return 'Tip: In backend/.env use localhost (not db) when running npm run dev on your machine.';
    }
    if (msg.includes('does not exist')) {
        return 'Tip: Create the DB and run: cd backend && npx prisma migrate deploy';
    }
    return msg;
}

void start();