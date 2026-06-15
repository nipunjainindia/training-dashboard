import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as sql from 'mssql';

const TABLE_SCHEMA = `
Table: Trainings
Columns:
  - Id (INT, PK, auto-increment)
  - EmployeeId (INT) — unique employee identifier
  - EmployeeName (NVARCHAR) — full name of the employee
  - EmployeeEmail (NVARCHAR) — employee email address
  - Leader (NVARCHAR) — department/leader the employee belongs to (e.g., Finance, Claims, Technology, Digital, Operations)
  - ManagerName (NVARCHAR) — employee's direct manager name
  - ManagerEmail (NVARCHAR) — manager email address
  - BusinessUnit (NVARCHAR) — business unit (e.g., HR, Technology, Sales, Finance, Claims, Underwriting, Operations)
  - Country (NVARCHAR) — country where employee is based (e.g., UK, UAE, India, US, Singapore)
  - TrainingName (NVARCHAR) — name of the training course
  - TrainingCategory (NVARCHAR) — category (e.g., Compliance, Leadership, Technical, AI, Insurance, Cyber Security)
  - IsMandatory (BIT) — 1 if mandatory, 0 if optional
  - Status (NVARCHAR) — training status: 'Completed', 'In Progress', 'Not Started', 'Overdue'
  - EnrollmentDate (DATE) — date employee was enrolled
  - DueDate (DATE) — training deadline
  - CompletionDate (DATE) — date training was completed (NULL if not completed)
  - TrainingHours (DECIMAL) — total hours for the training
  - AssessmentScore (DECIMAL) — score out of 100 (NULL if not completed)
  - TrainingProvider (NVARCHAR) — provider (e.g., Coursera, LinkedIn Learning, Workday, Udemy Business, Internal LMS)
  - LoadDate (DATE) — date the record was loaded

Important rules:
- Always use TOP instead of LIMIT for SQL Server
- Use GETDATE() for current date
- Use FORMAT(date, 'yyyy-MM') for month grouping
- Dates are stored as DATE type
- IsMandatory is BIT (1 = mandatory, 0 = optional)
- Only generate SELECT statements — never INSERT, UPDATE, DELETE, DROP, or any DDL
`;

const SYSTEM_PROMPT = `You are a SQL Server query expert for a Training Management dashboard.
Given the user's question, generate a single valid T-SQL SELECT query against the Trainings table.

${TABLE_SCHEMA}

Rules:
1. ONLY return the raw SQL query — no explanations, no markdown, no code blocks.
2. Only generate SELECT queries. If the user asks for anything else, return: ERROR: Only SELECT queries are allowed.
3. Use proper T-SQL syntax (TOP, FORMAT, GETDATE, ISNULL, CASE WHEN, etc.).
4. Limit results to 500 rows max using TOP 500 unless user specifies otherwise.
5. Include meaningful column aliases for readability.
6. Handle NULLs gracefully using ISNULL or COALESCE where appropriate.`;

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private openai: OpenAI;
  private sqlPool: sql.ConnectionPool;

  constructor(private readonly config: ConfigService) {
    this.openai = new OpenAI({
      apiKey: config.get('OPENAI_API_KEY'),
    });
  }

  private async getPool(): Promise<sql.ConnectionPool> {
    if (!this.sqlPool || !this.sqlPool.connected) {
      this.sqlPool = await sql.connect({
        server: this.config.get('DB_HOST'),
        port: +this.config.get('DB_PORT'),
        user: this.config.get('DB_USERNAME'),
        password: this.config.get('DB_PASSWORD'),
        database: this.config.get('DB_DATABASE'),
        options: {
          encrypt: true,
          trustServerCertificate: true,
        },
      });
    }
    return this.sqlPool;
  }

  async query(userPrompt: string): Promise<{
    sqlQuery: string;
    columns: string[];
    rows: Record<string, any>[];
    rowCount: number;
  }> {
    // Step 1: Ask OpenAI to generate SQL
    this.logger.log(`Generating SQL for: ${userPrompt}`);
    const completion = await this.openai.chat.completions.create({
      model: this.config.get('OPENAI_MODEL') || 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0,
      max_completion_tokens: 1000,
    });

    const generatedSql = completion.choices[0].message.content?.trim();

    if (!generatedSql || generatedSql.startsWith('ERROR:')) {
      throw new BadRequestException(
        generatedSql || 'Could not generate a valid SQL query.',
      );
    }

    // Step 2: Safety check — only allow SELECT
    const normalized = generatedSql.trim().toUpperCase();
    if (!normalized.startsWith('SELECT')) {
      throw new BadRequestException('Only SELECT queries are permitted.');
    }

    // Disallow dangerous keywords
    const dangerous = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'TRUNCATE', 'ALTER', 'EXEC', 'EXECUTE', 'XP_'];
    for (const kw of dangerous) {
      if (normalized.includes(kw)) {
        throw new BadRequestException(`Query contains disallowed keyword: ${kw}`);
      }
    }

    // Step 3: Execute against SQL Server
    this.logger.log(`Executing SQL: ${generatedSql}`);
    const pool = await this.getPool();
    const result = await pool.request().query(generatedSql);

    const rows = result.recordset;
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return {
      sqlQuery: generatedSql,
      columns,
      rows,
      rowCount: rows.length,
    };
  }
}
