export default async function handler(req, res) {
  // 1. Handle CORS Preflight (Crucial for browsers communicating with Vercel APIs)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // If it's just the browser checking permissions, say "OK" and stop here.
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Ensure only POST requests run the AI logic
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { message } = req.body;

    // 3. Connect to OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    // 4. Return the response to the frontend
    res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "No response generated."
    });

  } catch (error) {
    console.error("OpenRouter Connection Error:", error);
    res.status(500).json({ reply: "Error connecting to OkayBot. Please try again later." });
  }
}
