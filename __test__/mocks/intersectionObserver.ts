export function mockIntersectionObserver() {
    class IntersectionObserver {
      readonly root: Element | null = null
      readonly rootMargin: string = ''
      readonly thresholds: ReadonlyArray<number> = []
      
      constructor() {
        this.observe = jest.fn()
        this.unobserve = jest.fn()
        this.disconnect = jest.fn()
      }
  
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: IntersectionObserver,
    })
  }