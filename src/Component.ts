import type { Entity } from './Entity'

export abstract class Component {
  /**
   * The entity that the component is attached to.
   */
  public entity!: Entity

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
   * Called synchronously when the component is added to the entity. It is **not
   * guaranteed** that other components are added to the entity yet. Set up
   * anything strictly internal to this component here. Arguments passed to
   * `entity.components.add` are passed to this method.
   *
   * @example
   * ```ts
   * class ContainerComponent extends Component {
   *   container!: Phaser.GameObjects.Container
   *
   *   public init(x: number, y: number): void {
   *     this.container = this.entity.scene.add.container(x, y)
   *   }
   * }
   *
   * // Add the component to the entity
   *
   * this.entity.components.add(ContainerComponent, 0, 0)
   * ```
   */
  public init(...args: any[]): void {}

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
