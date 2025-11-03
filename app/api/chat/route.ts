import { db } from '@/db/db';
import { openai } from '@ai-sdk/openai';
import { groq } from '@ai-sdk/groq';
import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs } from 'ai';
import z from 'zod';


export const maxDuration = 30;
const SYSTEM_PROMPT = `You are an expert SQL assistant that helps users to query the database using natural language. 

${new Date().toLocaleString('sv-SE')}

You have access to the following tools:
- dbSchemaTool: call this tool to get the schema of the database which will help to write the SQL query.
- dbCallTool: call this tool to query the database using the SQL query you generated.

Rules:
  - Always use the schema provided to generate the SQL query.
  - Return a valid SQLite syntax query.
  - Pass the valid SQL syntax in dbCallTool tool.
  - Generate only SELECT queries (no INSERT, UPDATE, DELETE).
`;

const dbSchema = `CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER DEFAULT 0 NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  total_amount REAL NOT NULL,
  sale_date TEXT DEFAULT CURRENT_TIMESTAMP,
  customer_name TEXT NOT NULL,
  region TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE NO ACTION ON DELETE NO ACTION
);`;


export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: groq('openai/gpt-oss-20b'),
    messages: convertToModelMessages(messages),
    system: SYSTEM_PROMPT,
    stopWhen: stepCountIs(5),
    tools: {
        dbSchemaTool: tool({
          description: 'Call this tool to get schema of the database',
          inputSchema: z.object({ }),
          execute: async () => {
            return dbSchema
          },
        }),
        dbCallTool: tool({
          description: 'Call this tool to get data from the database',
          inputSchema: z.object({
            query: z.string().describe('The SQL query to be ran'),
          }),
          execute: async ({ query }) => {
            console.log(query);

            //gaurdrails
            return await db.run(query)
          },
        }),
      },  
  });

  return result.toUIMessageStreamResponse();
}