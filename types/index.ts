export type Message = {
  content: string;
  createdAt: unknown;
  userId: string;
};

export type User = {
  params: { emailAddress: string };
  uid: string;
  username: string;
  verified: boolean;
};
