export class StriclyOrdenedPromise {

    constructor(buffered, generator, onLoadingBuffer) {
  
      const scheme = async () => {
        if (this.order.length <= this.buffer) {
          const promise = this.generator()
          await promise
          this.order.push(promise)
          if (this.queue.length > 0) { await this.queue.shift()() }
          return this.state.cancelled ? null : await scheme()
        }
  
        if (this.queue.length > 0) {
          await this.queue.shift()()
          return await scheme()
        }
  
        this.state.running = false
      }
  
      this.order = []
      this.buffer = buffered
      this.queue = []
      this.test = []
      this.generator = generator
      this.analyzer = onLoadingBuffer == null ? () => new Promise(resolve => resolve()) : onLoadingBuffer
      this.untilPush = new Promise(r => r())
      this.state = {
        running: false,
        cancelled: false,
        promise: new Promise(id => id()),
        retrigger: async () => {
          if (this.state.running || this.state.cancelled) {
            return this.state.promise
          }
  
          this.state.running = true
          this.state.promise = scheme()
        }
      }
    }
  
    next() {
      if (this.order.length <= this.buffer) {
        const promise = new Promise(async resolve => {
          this.queue.push(async () => {
            resolve((await this.order.shift()))
          })
        })
  
        this.state.retrigger()
        return promise
      }
  
      this.state.retrigger()
      return this.order.shift()
    }
  
    set_max_buffer(max) {
      this.buffer = max
    }
  
    async map(f) {
      const updatePromises = async () => {
        for (let i = 0; i <= this.order.length - 1; i++) {
          const promise =  this.order[i]
          this.order[i] = new Promise(resolve => {
            queue.add_to_queue(async () => {
              // await this.analyzer()
              const r = f(await promise, this.generator)
              return resolve(r)
            })
          })
        }
    
        await queue.get_all_processes()
        this.state.cancelled = false
        this.state.retrigger()
      }
  
      const queue = new PromisseQueue()
      this.state.cancelled = true
      await this.promise
      updatePromises()
  
    }
  
    async clear() {
      this.state.cancelled = true
      await this.state.promise
      this.state.running = false
      this.state.promise = new Promise(id => id())
      this.state.cancelled = false
      this.order = []
    }
  
  }