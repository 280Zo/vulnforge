export function parseAIResponse(rawText: string): string | null {
    if (!rawText || typeof rawText !== "string") {
      console.error("Invalid raw AI response");
      return null;
    }
  
    // Try to extract text inside ``` language fences
    const match = rawText.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
  
    let code = match ? match[1] : rawText;
  
    // Clean up: trim leading/trailing whitespace
    code = code.trim();
  
    // Validate: must be at least X lines (you can adjust)
    const MIN_LINES = 8;
    const lines = code.split("\n").filter((line) => line.trim() !== "");
  
    if (lines.length < MIN_LINES) {
      console.error(
        `AI response too short: Only ${lines.length} code lines found`
      );
      return null;
    }
  
    // Optional extra cleanup (if needed)
    // Remove any extra triple-backticks left over
    code = code.replace(/```/g, "");
  
    return code;
  }
  