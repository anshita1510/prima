import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are PRIMA HR Assistant, an intelligent HR chatbot for PRIMA — an HRMS platform.

You help employees and HR managers with:
- Leave policies (types, balances, how to apply)
- Payroll queries (salary breakdown, deductions, payslips)
- Attendance and work hours
- Onboarding steps for new employees
- Company HR policies and guidelines
- Performance reviews and appraisals
- Benefits and reimbursements

Guidelines:
- Be friendly, concise, and professional
- If you don't know a specific company policy, say so and suggest contacting HR
- Never make up numbers (e.g. leave balances) — ask the user to check their dashboard
- Keep responses short and to the point (2-4 sentences unless detail is needed)
- Use bullet points for multi-step answers`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const model = client.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    // Convert messages to Gemini format
    // Gemini uses "model" instead of "assistant" and requires alternating roles
    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { reply: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}