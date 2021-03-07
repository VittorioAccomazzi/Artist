declare module "comlink-loader!*" {
    export type Worker<T> = {
      default: T
    }
    export type Comlink = {
      new <T>(): Worker<T>
    }
    const comlink: Comlink
    export default comlink
  }