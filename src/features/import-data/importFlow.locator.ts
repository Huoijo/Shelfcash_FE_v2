// Navigation state only. A locator never grants access or supplies business state.
export const importLocatorMismatch = (locator: string | null, loadedId: string | undefined) => !!locator && locator !== loadedId

export class ImportLocatorVisit {
  private visit = ''
  private attempted: string | null = null

  private enter(pathname: string, locator: string | null) {
    const visit = JSON.stringify([pathname, locator])
    if (visit !== this.visit) { this.visit = visit; this.attempted = null }
  }

  claim(pathname: string, locator: string | null, knownId: string | undefined, busy: boolean): boolean {
    this.enter(pathname, locator)
    if (pathname !== '/imports' || !locator || locator === knownId || busy || this.attempted === locator) return false
    this.attempted = locator
    return true
  }

  suppress(pathname: string, locator: string | null) {
    this.enter(pathname, locator)
    this.attempted = locator
  }
}
