import * as Phaser from 'phaser'
import { currentEntity, resetCurrentEntity, setCurrentEntity, type Component } from './Component'
import type { Entity } from './Entity'
import { getComponentMeta, type ComponentMetadata } from './utils/componentDecorator'
import type { ComponentConstructor } from './types'

type ComponentMapValue = {
  instance: Component
  meta?: ComponentMetadata
}

/**
 * A component system is a collection of components that are attached to an
 * entity. Components can be added, removed, and retrieved from the component
 * system.
 *
 * @example
 * ```ts
 * const componentSystem = new ComponentSystem(entity)
 * componentSystem.add(SpriteRendererComponent, 0, 0, 'ghost')
 * ```
 *
 * You may also listen for events on the component system:
 *
 * ```ts
 * componentSystem.on('add', (component) => {
 *   console.log('Component added:', component)
 * })
 * componentSystem.on('remove', (component) => {
 *   console.log('Component removed:', component)
 * })
 * ```
 */
export class ComponentSystem {
  public readonly events = new Phaser.Events.EventEmitter()

  constructor(private readonly entity: Entity) {}

  private componentsMap: Map<typeof Component, ComponentMapValue> = new Map()
  private componentsList: Component[] = []
  private componentsListDirty = true
  private createComponentsList: Component[] = []

  private rebuildList() {
    if (!this.componentsListDirty) return

    this.componentsList = Array.from(this.componentsMap.values())
      .sort((a, b) => {
        const aPriority = a.meta?.priority ?? 0
        const bPriority = b.meta?.priority ?? 0
        return aPriority - bPriority
      })
      .map((mapEntry) => mapEntry.instance)

    this.componentsListDirty = false
  }

  /**
   * Iterate over all components in the component system.
   *
   * @example
   * ```ts
   * this.entity.components.forEach((component) => {
   *   console.log(component)
   * })
   * ```
   */
  private forEach(callback: (component: Component) => void) {
    this.rebuildList()
    for (let i = 0; i < this.componentsList.length; i++) {
      callback(this.componentsList[i])
    }
  }

  /**
   * Get a component from the component system. Will throw an error if the
   * component is not found.
   *
   * @example
   * ```ts
   * const spriteRenderer = this.entity.components.get(SpriteRendererComponent)
   * ```
   */
  public get<T extends Component>(Component: ComponentConstructor<T>): T {
    const mapEntry = this.componentsMap.get(Component)
    if (!mapEntry) {
      throw new Error(`Component ${Component.name} not found on entity`)
    }
    return mapEntry.instance as T
  }

  /**
   * Get a component from the component system. Will return `undefined` if the
   * component is not found.
   *
   * @example
   * ```ts
   * const spriteRenderer = this.entity.components.find(SpriteRendererComponent)
   * ```
   */
  public find<T extends Component>(Component: ComponentConstructor<T>): T | undefined {
    return this.componentsMap.get(Component)?.instance as T | undefined
  }

  /**
   * Check if a component exists in the component system.
   *
   * @example
   * ```ts
   * const hasSpriteRenderer = this.entity.components.has(SpriteRendererComponent)
   * ```
   */
  public has<T extends Component>(Component: ComponentConstructor<T>): boolean {
    return this.componentsMap.has(Component)
  }

  /**
   * Add a component to the component system. Will throw an error if the
   * component already exists.
   *
   * The constructor of the component will be called with the given arguments.
   *
   * @example
   * ```ts
   * this.entity.components.add(SpriteRendererComponent, 0, 0, 'ghost')
   * ```
   */
  public add<T extends ComponentConstructor>(
    Component: T,
    ...args: ConstructorParameters<T>
  ): InstanceType<T> {
    if (this.componentsMap.has(Component)) {
      throw new Error(`Can't add component because ${Component.name} already exists`)
    }

    setCurrentEntity(this.entity)
    const instance = new Component(args as unknown as [])
    resetCurrentEntity(this.entity)
    instance.entity = this.entity

    const meta = getComponentMeta(Component)

    this.componentsMap.set(Component, {
      instance,
      meta
    })

    this.createComponentsList.push(instance)
    this.componentsListDirty = true

    this.events.emit('add', instance)
    this.events.emit('update')
    return instance as InstanceType<T>
  }

  /**
   * Remove a component from the component system.
   *
   * @example
   * ```ts
   * this.entity.components.remove(SpriteRendererComponent)
   * ```
   */
  public remove<T extends Component>(Component: ComponentConstructor<T>) {
    const mapEntry = this.componentsMap.get(Component)
    if (!mapEntry) return
    this.componentsMap.delete(Component)
    this.componentsListDirty = true

    // Edge case: If the component is not yet created but should be removed, we
    // need to remove it from the create list too.
    if (this.createComponentsList.length > 0) {
      this.createComponentsList = this.createComponentsList.filter((c) => c !== mapEntry.instance)
    }

    this.events.emit('remove', mapEntry.instance)
    this.events.emit('update')
  }

  /**
   * Get all currently registered components.
   */
  public all(): Component[] {
    this.rebuildList()
    return this.componentsList
  }

  /**
   * Remove all components from the component system.
   *
   * @example
   * ```ts
   * this.entity.components.clear()
   * ```
   */
  public clear() {
    this.componentsMap.clear()
    this.componentsList = []
    this.componentsListDirty = false
  }

  /**
   * Run the `update` method on all components. If the component is not yet
   * created, it will be created first.
   *
   * @internal
   */
  public updateComponents(time: number, delta: number) {
    this.createComponents()
    this.forEach((component) => {
      component.update(time, delta)
    })
  }

  /**
   * Run the `create` method on all components that are not yet created.
   *
   * @internal
   */
  private createComponents() {
    if (this.createComponentsList.length === 0) return
    this.createComponentsList.forEach((component) => {
      // check for the required components
      const m = this.componentsMap.get(component.constructor as ComponentConstructor)
      if (m?.meta?.required) {
        for (const required of m.meta.required) {
          if (!this.componentsMap.has(required)) {
            throw new Error(`Can't add component because ${required.name} is not present`)
          }
        }
      }
      component.create()
    })
    this.createComponentsList = []
  }

  /**
   * Run the `destroy` method on all components.
   *
   * @internal
   */
  public destroyComponents() {
    this.forEach((component) => {
      component.destroy()
    })
  }
}
