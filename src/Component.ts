import type { ComponentConstructor } from './types'
import type { Entity } from './Entity'
import type { EntitySystem } from './EntitySystem'
import type { Scene } from './Scene'

export let currentEntity: Entity | undefined

export const setCurrentEntity = (entity: Entity) => {
  currentEntity = entity
}

export const resetCurrentEntity = () => {
  currentEntity = undefined
}

/**
 * Symbol used to identify the method that will be called to create and update
 * the component.
 */
export const createAndUpdate = Symbol('createAndUpdate')

export abstract class Component {
  public priority: number = 0
  public required: ComponentConstructor[] = []

  private created = false

  private checkRequired() {
    if (this.required.length > 0) {
      const missing = this.required.filter((r) => !this.entity.components.has(r)).map((r) => r.name)
      const thisName = this.constructor.name
      if (missing.length > 0) {
        throw new Error(`${thisName}: missing required components: ${missing.join(', ')}`)
      }
    }
  }

  [createAndUpdate](time: number, delta: number) {
    if (!this.created) {
      this.checkRequired()
      this.create()
      this.created = true
    }
    this.update(time, delta)
  }

  /**
   * The entity that the component is attached to.
   */
  private _entity?: Entity

  get entity(): Entity {
    const entity = this._entity || currentEntity
    if (!entity) throw new Error('No entity set')
    return entity
  }

  set entity(value: Entity) {
    this._entity = value
  }

  get entities(): EntitySystem {
    return this.entity.scene.entities
  }

  get scene(): Scene {
    return this.entity.scene
  }

  /**
   * Called in the first update loop after the component is added to the entity.
   * Other components are guaranteed to be added to the entity at this point.
   * Get references to other components here.
   *
   * @example
   * ```ts
   * class MyComponent extends Component {
   *   public otherComponent!: OtherComponent
   *
   *   public create(): void {
   *     this.otherComponent = this.entity.components.get(OtherComponent)
   *   }
   * }
   * ```
   */
  public create(): void {}

  /**
   * Called when the associated entity is updated.
   *
   * @example
   * ```ts
   * class MyComponent extends Component {
   *   private image!: Phaser.GameObjects.Image
   *
   *   public update(time: number, delta: number): void {
   *     this.image.x += delta
   *   }
   * }
   * ```
   */
  public update(time: number, delta: number): void {}

  /**
   * Called when the scene this component is attached to is put to sleep.
   */
  public sleep(): void {}

  /**
   * Called when the scene this component is attached to is woken up from a
   * sleep state.
   */
  public wake(): void {}

  /**
   * Called when the scene this component is attached to is paused.
   */
  public pause(): void {}

  /**
   * Called when the scene this component is attached to is resumed from a
   * paused state.
   */
  public resume(): void {}

  /**
   * Called when the entity is destroyed as part of a scene destroy or shutdown
   * or via `entity.destroy()`.
   *
   * @example
   * ```ts
   * class MyComponent extends Component {
   *   public destroy(): void {
   *     this.image.destroy()
   *   }
   * }
   * ```
   */
  public destroy(): void {}
}
