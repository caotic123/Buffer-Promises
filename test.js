const {StriclyOrdenedPromise, PromisseQueue} = require("./index.js")

const justAwait = (time, action) => {
  console.log("iniciando")
  return new Promise(resolve => setTimeout(() => {
  resolve(action())
}, time))
}

async function sync() {
  let counter = 1
  const r = new StriclyOrdenedPromise(10, () => justAwait(10000, () => counter++))
  r.start()
  
  // WAIT FOR 5 (OR LESS) BUFFERS 
  await justAwait(5*10000, () => {
    console.log("Now, probably the buffer has 5 requistions already loaded")
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
