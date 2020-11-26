# Buffer-Promises

Buffer-promises is a simple implementation of buffer using promises as generators. The goal is to preload a amount of data to request after, for example if you're doing pagination but you do not want to request all full data, neither request information while the user still playing your app.


# Loading a generator

To create a instance just import the StriclyOrdenedPromise and call the constructor.
```js
const my_instance = new StriclyOrdenedPromise<T>(BUFFER_SIZE : number, GENERATOR : () => Promise<T>)
```

BUFFER_SIZE is the size of buffer, that means the library will save the maximum of BUFFER_SIZE. Everytime that you request a value of the queue the StriclyOrdenedPromise will load the amount of buffer which was taked. The queue always will try to be full (full in that case it is the size of BUFFER_SIZE properly).

For example :

```js
const justAwait = (time, action) => {
    return new Promise(resolve => setTimeout(() => resolve(action()), time))
}

async function sync() {
  let counter = 1
  const r = new StriclyOrdenedPromise(10, () =>  justAwait(10000, () => counter++))
  r.start()
  
  // WAIT FOR 5 (OR LESS) BUFFERS 
  await justAwait(5*10000, () => {
    console.log("Now, the buffer have 5 requistions already loaded")
  })

  // *Probably* prints without waiting
  for (let x=1; x <= 5; x++) {
    console.log(await r.next())
  }

    // PROBABLY WILL NEED 50000 SECONDS TO PRINT
  for (let x=1; x <= 5; x++) {
    console.log(await r.next())
  }
}
sync()

```

You might notice that ouput is synchronous, that means every requisition is requested if and only if the last requisition is finished. Normally buffers needs to be synchronous, once they can depends of each other. 

You can create asynchronous generators just returning a Promise resolved :

```js
  const r = new StriclyOrdenedPromise(10, () => {
      return Promise.resolve(justAwait(10000, () => counter++))
  })

  const promise = await r.next() // The promise unloaded
  console.log(await promise) // Now, waits until the 10000 seconds is finished
```

# Reloading a buffer

If you need reload the whole buffer you can just map and return the generator again :

```js
const r = new StriclyOrdenedPromise(10, () => axios.get("http://...", {})
await justAwait(10000, () => {
    console.log("10 seconds have passed")
})

await r.map((value, generator) => generator()) //RESETS ALL BUFFER AND REQUEST FOR EACH BUFFER LOADED
```

Mapping stops the queue before of perfoming a mapping to avoid race problems.
Optionally maybe you do not want to reload all buffers but just the failed promises 

```js
await r.map((value, generator) => value == null ? generator() : value)
```

This overwrite the requisition already loaded and return a new if the value is not valid.

# PromisseQueue

The PromisseQueue is a internal class of StriclyOrdenedPromise, PromisseQueue don't have a buffer but always executes synchronously the promise:

```js
  const queue = new PromisseQueue()
  queue.add.add_to_queue(() => justAwait(10000, () => console.log("first")))
  const last = new Promise(resolve => queue.add.add_to_queue(() => justAwait(1, () => {
      console.log("second")
      resolve()
  })))
  queue.get_all_processes()
  await last() //after waiting 10000 seconds prints "first" and finally prints "second"

```


