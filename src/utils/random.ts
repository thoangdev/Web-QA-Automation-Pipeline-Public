export const random = {
  string: (prefix = 'test') =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,

  email: (domain = 'example.com') =>
    `test-${Date.now()}@${domain}`,

  number: (min = 0, max = 100) =>
    Math.floor(Math.random() * (max - min + 1)) + min,
};
