import type { Component } from '../Component'
import type { ComponentConstructor } from '../types'

export interface ComponentMetadata {
  /**
   * The priority of the component. Components with a lower priority will be
   * updated first.
   *
   * @default 0
   */
  priority?: number
  /**
   * The components that are required by the component.
   */
  required?: ComponentConstructor[]
}

const componentMetadata = new Map<Function, ComponentMetadata>()

export function getComponentMeta<T extends Component>(
  constructor: ComponentConstructor<T>
): ComponentMetadata | undefined {
  return componentMetadata.get(constructor)
}

/**
 * Annotates a component with metadata.
 *
 * @param meta - The metadata for the component.
 * @returns A class decorator.
 */
export function component(meta: ComponentMetadata = {}): ClassDecorator {
  return (target) => {
    componentMetadata.set(target, meta)
  }
}
