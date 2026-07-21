const blockedTerms = /\b(medical|medicine|medication|dosage|diagnos|treatment|prescription|first aid|cpr|legal|law|lawsuit|arrest|contract|tax|safety|electrical wiring|firearm|weapon|explosive|foraging|poison)\b/i;
export const isBlockedTopic = (topic: string) => blockedTerms.test(topic);
