import type { Entity } from './Entity'

export let currentEntity: Entity | undefined

export const setCurrentEntity = (entity: Entity) => {
  currentEntity = entity
}

export const resetCurrentEntity = (entity: Entity) => {
  currentEntity = undefined
}

export abstract class Component {
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

  /**
   * Add an event listener to the entity's lifecycle. The listener will
   * automatically be removed once the entity is destroyed.
   *
   * @example
   * ```ts
   * this.listen(this.someComponent, 'update', (data) => {
   *   console.log(data)
   * })
   * ```
   */
  protected listen<T extends Phaser.Events.EventEmitter>(obj: T, ...args: Parameters<T['on']>) {
    obj.on(...(args as unknown as [any, any, any]))
    this.entity.events.once('destroy', () => {
      obj.off(...(args as unknown as [any, any, any]))
    })
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
   * Called when the entity is destroyed via `entity.destroy()`. Clean up
   * anything that needs to be cleaned up here.
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
