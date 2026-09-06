export async function verifyRecaptcha(
  token: string | null | undefined
): Promise<{ success: boolean; score?: number; error?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // In development or if secret key is omitted, bypass validation gracefully
  if (!secretKey) {
    return { success: true, score: 1.0 };
  }

  if (!token) {
    return { success: false, error: "Missing reCAPTCHA security token." };
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    });

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: "reCAPTCHA verification failed. Bot activity suspected.",
      };
    }

    // Google reCAPTCHA v3 returns a score between 0.0 (bot) and 1.0 (human)
    if (typeof data.score === "number" && data.score < 0.4) {
      return {
        success: false,
        score: data.score,
        error: `reCAPTCHA threat score too low (${data.score}). Automated traffic flagged.`,
      };
    }

    return { success: true, score: data.score };
  } catch (err: any) {
    console.error("[RECAPTCHA SERVER ERROR]", err);
    return {
      success: false,
      error: "Unable to verify security certificate with Google reCAPTCHA service.",
    };
  }
}
