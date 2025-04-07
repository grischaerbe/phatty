import type { Component } from './Component'

export type ComponentConstructor<T extends Component = Component> = new (...args: any[]) => T

export type EntityQueryOptions = {
  with?: ComponentConstructor[] | ComponentConstructor
  without?: ComponentConstructor[] | ComponentConstructor
}
