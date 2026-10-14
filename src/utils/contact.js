export const PHONE = "919964957015";
export const PHONE_PRETTY = "+91 99649 57015";
export const TEL = `tel:+${PHONE}`;
export const EMAIL = "slrproperties.official@gmail.com";
export const INSTAGRAM = "https://www.instagram.com/slrproperties.official";
export const CHANNEL = "https://whatsapp.com/channel/0029VbCSJitFXUug5499ml1w";
export const WA = `https://wa.me/${PHONE}`;

export const waLink = (text) => `${WA}?text=${encodeURIComponent(text)}`;
export const mailLink = (subject, body = "") =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;
