const fs = require("fs");
const pdf = require("pdf-parse");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const parseResumeMiddleware = async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: "No file uploaded" });

        // 1. Read PDF
        console.log("📄 Reading PDF file...");
        const dataBuffer = fs.readFileSync(req.file.path);

        // 2. Parse Text
        const pdfData = await pdf(dataBuffer);
        const rawText = pdfData.text;

        // 3. Extract with AI
        console.log("🤖 Extracting data with AI...");
        const systemPrompt = `You are a Resume Parser. Extract the following details from the resume text below.
        Return ONLY a strict JSON object (no markdown) with these keys:
        - fullName (string)
        - technicalSkills (array of strings, max 5)
        - mostImpressiveProject (string, summary in 1 sentence)
        
        Resume Text:
        ${rawText.substring(0, 3000)}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Extract data." },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" },
        });

        const resumeData = JSON.parse(
            completion.choices[0]?.message?.content || "{}"
        );

        // Cleanup
        try {
            fs.unlinkSync(req.file.path);
        } catch (e) {}

        console.log("✅ Success! Candidate:", resumeData.fullName);
        res.json({ success: true, data: resumeData });
    } catch (error) {
        console.error("❌ Parsing Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to parse resume",
        });
    }
};

module.exports = { parseResumeMiddleware };
