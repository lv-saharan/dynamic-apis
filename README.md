# dynamic-apis

dynamic apis，use proxy create restful controller

# install

```bash
npm i dynamic-apis
```

# usage

## create controller

```javascript
import { createController } from "dynamic-apis";
//使用json-server 测试
const baseURL = "http://127.0.0.1:3000/";
const postCtrler = createController("posts", baseURL);
//with header
const postCtrler = createController("posts", baseURL, {
  "some-header": "header-value",
});
//dynamic header
let count = 0;
const postCtrler = createController("posts", baseURL, () => {
  return { "some-header": "header-value", 
           "count-header": count++,
           "AuthToken":getToken()
         };
});
```

## get all

```javascript
let posts = await postCtrler.get();
//fetch   :GET  http://127.0.0.1:3000/posts
```

## get by id

```javascript
let posts = await postCtrler.get(1);
//fetch   :GET  http://127.0.0.1:3000/posts/1

//batch
let posts = await postCtrler.get(1, 2, 3);
//fetch   :GET  http://127.0.0.1:3000/posts/1,2,3
//warning json-server not support
```

## query

```javascript
let posts = await postCtrler.get({ author: "saharan" });
//fetch   :GET  http://127.0.0.1:3000/posts?author=saharan

let posts = await postCtrler.get({ author: ["saharan","you","others" });
//fetch   :GET  http://127.0.0.1:3000/posts?author=saharan&author=you&author=others

let posts = await postCtrler.get({ user: { author: "saharan" } });
//fetch   :GET  http://127.0.0.1:3000/posts?user.author=saharan
```

## post

```javascript
let result = await postCtrler.add({
  title: "dynamic api",
  author: "saharan",
});
//fetch :POST http://127.0.0.1:3000/posts
//body :{...}
//postCtrler.post also work
```

## put

```javascript
let result = await postCtrler.put(1, {
  title: "dynamic api",
  author: "saharan",
});
//fetch :PUT http://127.0.0.1:3000/posts/1
//body :{...}
//postCtrler.update also work
```

## patch

```javascript
let result = await postCtrler.modify(1, {
  author: "saharan",
});
//fetch :PATCH http://127.0.0.1:3000/posts/1
//body :{...}
//postCtrler.patch also work
```

## delete

```javascript
let result = await postCtrler.del(1);
//fetch :DELETE http://127.0.0.1:3000/posts/1

//batch
let result = await postCtrler.del(1, 2, 3);
//fetch :DELETE http://127.0.0.1:3000/posts/1,2,3
```

## path,id support

```javascript
const result = await postCtrler.id(2).comments.get();
//fetch :GET  http://127.0.0.1:3000/posts/1/comments
//  postCtrler.path(2).comments.get() also work

const addResult = await postCtrler.id(2).comments.add({
  body: "some comment!!!",
  postId: 2,
});
//fetch :POST  http://127.0.0.1:3000/posts/1/comments

//some server api name contains (get|add |...) method prefix

const result = await someCtrler.path("getUser").get(userId);

//fetch :GET http://127.0.0.1:3000/some.../getUser/userId
```
