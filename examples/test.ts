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
// const commentsAndUsers = post<"comments" | "users">();
// commentsAndUsers.get();
// const n = post.b<number>(1);

post.a.b(1).c.get(1);
const r = await post.aaa.getList<number>();
const result = post.getList<any[]>({ name: "lv" });
