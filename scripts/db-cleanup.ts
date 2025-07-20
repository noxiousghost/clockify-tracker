import { deleteOldSessions } from '../lib/db.js';

const days = process.argv[2] ? parseInt(process.argv[2], 10) : 5;

deleteOldSessions(days);

console.log(`Deleted sessions older than ${days} days.`);
