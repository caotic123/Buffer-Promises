# Buffer-Promises

Buffer-promises is a simple implementation of buffer using promises as generators. The goal is to preload a amount of data to request after, for example if you're doing pagination but you do not want to request all full data, neither request information as the user still playing your app.


# Loading a generator

To create a instance just import the StriclyOrdenedPromise and call the constructor.
```js
const my_instance = new StriclyOrdenedPromise<T>(BUFFER_SIZE : number, GENERATOR : () => Promise<T>)
```

BUFFER_SIZE is a the size of buffer, that means the library will save the maximum of BUFFER_SIZE. Everytime that you request a value of the queue the StriclyOrdenedPromise will load the amount of buffer which was taked. The queue always will try to be full (full in that case it is the size of BUFFER_SIZE properly).

For example :

```js
  let counter = 1
  let list = []
  const r = new StriclyOrdenedPromise(10, () =>  justAwait(1000, () => list.push(counter++)))
  await justWait(5000, () => {
      console.log("Five requistions )
  })
  for (let x=1; x <= 10; x++) {
    await r.next()
  }

  console.log(list)
  // OUTPUT [1, 2, 3, 4,  5, 6, 7, 8, 9, 10]
}

```

You might notice that ouput is synchronous, that means every requisition is requested if and only if the last requisition is finished. Normally buffers needs to be synchronous, 
