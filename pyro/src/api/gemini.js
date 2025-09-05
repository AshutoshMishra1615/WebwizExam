// src/api/gemini.js
import axios from "axios";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const generateURDF = async (prompt) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are a URDF generator for robots.
Only output valid URDF XML without explanations or formatting.
Do not wrap inside markdown fences like \`\`\`xml or \`\`\`.
Generate a URDF for the following description:

"${prompt}"`,
              },
            ],
          },
        ],
      }
    );

    let urdfCode =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "<robot name='default_robot'></robot>";

    // 🔹 Strip out ```xml ... ``` if Gemini adds it
    urdfCode = urdfCode.replace(/```xml|```/g, "").trim();

    return urdfCode;
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    return "<robot name='error_robot'></robot>";
  }
};
