import bcrypt from "bcrypt";
import { seed } from "drizzle-seed";

import { db } from "./db/index.js";
import { users, posts, comments, likes } from "./db/schema.js";

const schema = { users, posts, comments, likes };

async function main() {
const password_hash = await bcrypt.hash("Test123456!", 10);

await seed(db, schema, { count: 5, seed: 12345 }).refine((funcs) => ({
users: {
count: 5,
columns: {
username: funcs.fullName(),
email: funcs.email(),
password_hash: funcs.default({
defaultValue: password_hash,
}),
created_at: false,
},
},

posts: {
  count: 10,
  columns: {
    content: funcs.loremIpsum({ sentencesCount: 3 }),
    image: false,
    created_at: false,
  },
},

comments: {
  count: 15,
  columns: {
    content: funcs.loremIpsum({ sentencesCount: 2 }),
    created_at: false,
  },
},

likes: {
  count: 10,
  columns: {
    created_at: false,
  },
},
}));

console.log("Seed completed successfully!");
console.log("Demo password for seeded users: Test123456!");
}

main()
.catch((error) => {
console.error("Seed failed:", error);
process.exitCode = 1;
})
.finally(async () => {
await db.$client.end();
});
