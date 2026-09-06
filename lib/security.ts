export async function verifyRecaptcha(token?: string): Promise<{ success: boolean; score?: number; error?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    // If not configured, allow in development/fallback mode
    return { success: true, score: 1.0 };
  }

  if (!token) {
    return { success: false, error: "reCAPTCHA verification token missing." };
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      return { success: false, error: "reCAPTCHA verification failed." };
    }

    return { success: true, score: data.score };
  } catch (err: any) {
    console.error("[RECAPTCHA VERIFY ERROR]", err);
    return { success: false, error: err.message || "Failed to contact reCAPTCHA server." };
  }
}
