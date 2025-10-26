import en from "../messages/en.json";
import ar from "../messages/ar.json";

const messages = {
  en,
  ar,
};

export function getMessages(locale) {
  return messages[locale] || messages.en;
}
