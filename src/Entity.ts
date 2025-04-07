import { ComponentSystem } from './ComponentSystem'
import type { Scene } from './Scene'

export class Entity {
  public components: ComponentSystem

  constructor(public readonly scene: Scene) {
    this.components = new ComponentSystem(this)
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
    // Hand off to the entity system to remove the entity
    this.scene.entities.destroy(this)
  }
}
