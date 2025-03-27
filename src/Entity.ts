import * as Phaser from 'phaser'
import { ComponentSystem } from './ComponentSystem'

export class Entity {
  events = new Phaser.Events.EventEmitter()
  components: ComponentSystem

  constructor(public readonly scene: Phaser.Scene) {
    this.components = new ComponentSystem(this)
    this.registerListeners()
  }

  private registerListeners() {
    this.scene.sys.events.on('update', this.update, this)
    this.scene.sys.events.on('destroy', this.destroy, this)
  }

  private unregisterListeners() {
    this.scene.sys.events.off('update', this.update, this)
    this.scene.sys.events.off('destroy', this.destroy, this)
  }

  private update(time: number, delta: number): void {
    this.components.updateComponents(time, delta)
  }

  /**
   * Destroy the entity and all of its components. Will invoke
   * `onDestroy` on all components.
   *
   * @example
   * ```ts
   * entity.destroy()
   * ```
   */
  destroy(): void {
    this.unregisterListeners()
    this.components.destroyComponents()
    this.events.emit('destroy')
  }
}
