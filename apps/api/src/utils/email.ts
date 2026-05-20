export async function sendEmail(to: string, subject: string, content: string) {
  const payload = { to, subject, content };
  return Promise.resolve(payload);
}
