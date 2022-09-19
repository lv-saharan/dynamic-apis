# dynamic-apis
dynamic apis，use proxy create restful controller
# install 
``` bash
npm i dynamic-apis
```

# usage
## create controller
``` javascript
 const baseURL = 'http://127.0.0.1:3000/'
 const postCtrler = createController("posts", baseURL)
```

## get all
``` javascript
  let posts = await postCtrler.get()
  //fetch   :GET  http://127.0.0.1:3000/posts
```

## get by id 
``` javascript
  let posts = await postCtrler.get(1)
  //fetch   :GET  http://127.0.0.1:3000/posts/1
```


## query
``` javascript
  let posts = await postCtrler.get({author:'saharan'})
  //fetch   :GET  http://127.0.0.1:3000/posts?author=saharan
```

## post
``` javascript
  let result= await postCtrler.add({
                "title": "dynamic api",
                "author": "saharan"
            })
  //fetch :POST http://127.0.0.1:3000/posts 
  //body :{...}
  //postCtrler.post also work
```

## put
``` javascript
  let result= await postCtrler.put(1,{
                "title": "dynamic api",
                "author": "saharan"
            })
  //fetch :PUT http://127.0.0.1:3000/posts/1 
  //body :{...}
  //postCtrler.update also work
```
## patch
``` javascript
  let result= await postCtrler.modify(1,{
                "author": "saharan"
            })
  //fetch :PATCH http://127.0.0.1:3000/posts/1 
  //body :{...}
  //postCtrler.patch also work
```

## path,id support
``` javascript
  const result=await postCtrler.id(2).comments.get()
  //fetch :GET  http://127.0.0.1:3000/posts/1/comments 
  //  postCtrler.path(2).comments.get() also work
  
 const addResult =await postCtrler.id(2).comments.add({
                "body": "some comment!!!",
                "postId": 2
            })
  //fetch :POST  http://127.0.0.1:3000/posts/1/comments 
  
  
```
