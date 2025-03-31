import * as Phaser from 'phaser'
import { EntityLifecycle } from 'src/EntityLifecycle'
import { ComponentSystem } from './ComponentSystem'

export class Entity {
  public components: ComponentSystem
  private lifecycle: EntityLifecycle

  constructor(public readonly scene: Phaser.Scene) {
    this.components = new ComponentSystem(this)
    this.lifecycle = new EntityLifecycle(this)
  }

  /**
   * Destroy the entity and all of its components. Will invoke
   * `destroy` on all components.
   *
   * @example
   * ```ts
   * entity.destroy()
   * ```
   */
  destroy(): void {
    this.lifecycle.destroy()
  }
}
