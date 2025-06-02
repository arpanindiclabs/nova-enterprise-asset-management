const axios = require('axios');
const readline = require('readline');
const { pool } = require('./db');

const chatHistories = new Map();

function getChatHistory(sessionId) {
  if (!chatHistories.has(sessionId)) chatHistories.set(sessionId, []);
  return chatHistories.get(sessionId);
}

function appendToChatHistory(sessionId, role, content) {
  const history = getChatHistory(sessionId);
  history.push({ role, content });
  if (history.length > 10) history.shift();
}

function extractSQL(output) {
  if (!output) return '';

  const codeBlockMatch = output.match(/```sql([\s\S]*?)```/i);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  const sqlMatch = output.match(/(select|with)[\s\S]*/i);
  return sqlMatch ? sqlMatch[0].trim() : '';
}

function getQueryType(sql) {
  const match = sql.trim().toLowerCase().match(/^(select|with|insert|update|delete)/);
  return match ? match[1] : null;
}

async function runQuery(sqlQuery) {
  try {
    console.log('🟡 Executing SQL query:', sqlQuery);
    const result = await pool.request().query(sqlQuery);
    console.log('🟢 DB Query Result:', result);
    return { success: true, data: result.recordset };
  } catch (err) {
    console.error('🔴 DB Query Error:', err);
    return { success: false, error: err.message };
  }
}

async function callAiModelStream(messages, onData) {
  const response = await axios({
    method: 'post',
    url: 'http://127.0.0.1:1234/v1/chat/completions',
    data: {
      model: 'phi-3.1-mini-128k-instruct',
      messages,
      stream: true,
    },
    headers: { 'Content-Type': 'application/json' },
    responseType: 'stream',
    timeout: 60000,
  });

  return new Promise((resolve, reject) => {
    let collected = '';
    const rl = readline.createInterface({ input: response.data });

    rl.on('line', (line) => {
      line = line.trim();
      if (!line) return;

      if (line === 'data: [DONE]') {
        rl.close();
        resolve(collected);
        return;
      }

      if (line.startsWith('data: ')) {
        try {
          const jsonStr = line.slice('data: '.length);
          const parsed = JSON.parse(jsonStr);

          const delta = parsed.choices?.[0]?.delta;
          if (delta?.content) {
            collected += delta.content;
            onData(delta.content);
          }
        } catch (err) {
          console.error('Error parsing JSON chunk:', err, line);
        }
      }
    });

    rl.on('close', () => resolve(collected));
    rl.on('error', reject);
  });
}

async function setupAiSqlEndpoint(app) {
  app.post('/query', async (req, res) => {
    try {
      const { prompt, confirmUpdate = false, sessionId = 'default' } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const enforcedPrompt = `DO NOT USE ALIASES AND USE ONLY THE TABLE NAMES IN CONTEXT. ${prompt}`;
      appendToChatHistory(sessionId, 'user', enforcedPrompt);

      const maxRetries = 3;
      let attempt = 0;
      let finalSql = '';
      let queryResult = null;

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });

      while (attempt < maxRetries) {
        console.log(`\n🔁 Attempt #${attempt + 1} for prompt: "${enforcedPrompt}"`);

        const systemPrompt = {
          role: 'system',
          content: `## Primary Function
You are a READ-ONLY SQL query generator for an IT Asset Management System. Your sole purpose is to generate SELECT queries to display data. You CANNOT and WILL NOT generate INSERT, UPDATE, DELETE, or any data modification queries. Please generate SQL queries without using table aliases. Use full table names for all columns.
IMPORTANT: Do NOT use any table aliases like "e", "am", etc. in your SQL.`,
        };

        const messages = [systemPrompt, ...getChatHistory(sessionId)];

        const aiResponse = await callAiModelStream(messages, (chunkText) => {
          res.write(`data: ${chunkText.replace(/\n/g, '\\n')}\n\n`);
        });

        console.log('📥 Full AI Response:\n', aiResponse);

        appendToChatHistory(sessionId, 'user', aiResponse);

        finalSql = extractSQL(aiResponse);

        if (!finalSql) {
          res.write(`data: [ERROR] No valid SQL query generated. Retrying...\n\n`);
          attempt++;
          continue;
        }

        finalSql = finalSql.replace(/`/g, '').replace(/;$/, '').trim();

        const queryType = getQueryType(finalSql);
        console.log('🧠 Detected query type:', queryType);
        console.log('🔍 Final SQL to execute:', finalSql);

        if (!queryType || (queryType !== 'select' && queryType !== 'with')) {
          res.write(`data: [ERROR] Only SELECT and WITH queries allowed. Detected: ${queryType}\n\n`);
          res.end();
          return;
        }

        if ((queryType === 'update' || queryType === 'insert' || queryType === 'delete') && !confirmUpdate) {
          res.write(`data: [CONFIRM] Data modification query detected. Please confirm with confirmUpdate=true.\n\n`);
          res.end();
          return;
        }

        queryResult = await runQuery(finalSql);

        if (queryResult.success) {
          console.log('✅ SQL query executed successfully.');
          break;
        } else {
          appendToChatHistory(
            sessionId,
            'user',
            `The SQL query failed with the error:\n${queryResult.error}\nPlease correct and regenerate the SQL.`
          );
          res.write(`data: [ERROR] SQL query failed: ${queryResult.error}\n\n`);
          attempt++;
        }
      }

      if (!queryResult || !queryResult.success) {
        res.write(`data: [ERROR] Failed to generate and execute a valid SQL query after ${maxRetries} attempts.\n\n`);
        res.end();
        return;
      }

      res.write(`data: [SUCCESS] SQL query executed successfully.\n\n`);
      res.write(`data: ${JSON.stringify({ query: finalSql, data: queryResult.data })}\n\n`);
      res.end();
    } catch (error) {
      console.error('❌ Unexpected error in /query endpoint:', error);
      res.status(500).json({ error: error.message });
    }
  });
}

module.exports = { setupAiSqlEndpoint };
