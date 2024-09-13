import { createController } from "../src/controller";

const post = createController("post", "/api/v1");
post
  .get<{
    data: {
      name: string;
      age: number;
    };
  }>("1")
  .then(({ data }) => {});

post.a.b.c.get(1);
const commentsAndUsers = post<"comments" | "users">();
commentsAndUsers.get();
const n = post.b<number>(1);


