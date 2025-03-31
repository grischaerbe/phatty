import type { Component } from 'src/Component'
import type { Entity } from 'src/Entity'

export class EntityLifecycle {
  private createComponentsList: Component[] = []

  constructor(private readonly entity: Entity) {
    this.registerListeners()
  }

  private registerListeners() {
    this.entity.scene.sys.events.on('update', this.update, this)
    this.entity.scene.sys.events.on('sleep', this.sleep, this)
    this.entity.scene.sys.events.on('wake', this.wake, this)
    this.entity.scene.sys.events.on('pause', this.pause, this)
    this.entity.scene.sys.events.on('resume', this.resume, this)
    this.entity.scene.sys.events.on('destroy', this.destroy, this)
    this.entity.scene.sys.events.on('shutdown', this.destroy, this)
    this.entity.components.events.on('add', this.onComponentAdded, this)
    this.entity.components.events.on('remove', this.onComponentRemoved, this)
  }

  private unregisterListeners() {
    this.entity.scene.sys.events.off('update', this.update, this)
    this.entity.scene.sys.events.off('sleep', this.sleep, this)
    this.entity.scene.sys.events.off('wake', this.wake, this)
    this.entity.scene.sys.events.off('pause', this.pause, this)
    this.entity.scene.sys.events.off('resume', this.resume, this)
    this.entity.scene.sys.events.off('destroy', this.destroy, this)
    this.entity.scene.sys.events.off('shutdown', this.destroy, this)
    this.entity.components.events.off('add', this.onComponentAdded, this)
    this.entity.components.events.off('remove', this.onComponentRemoved, this)
  }

  private onComponentAdded(component: Component) {
    this.createComponentsList.push(component)
  }

  private onComponentRemoved(component: Component) {
    this.createComponentsList = this.createComponentsList.filter((c) => c !== component)
  }

  private update(time: number, delta: number): void {
    if (this.createComponentsList.length > 0) {
      this.createComponentsList.forEach((component) => {
        // Check the required components
        const requiredComponents = component.required
        for (const required of requiredComponents) {
          if (!this.entity.components.has(required)) {
            throw new Error(`Can't add component because ${required.name} is not present`)
          }
        }
        component.create()
      })
      this.createComponentsList = []
    }
    this.entity.components.forEach((component) => {
      component.update(time, delta)
    })
  }

  private sleep(): void {
    this.entity.components.forEach((component) => {
      component.sleep()
    })
  }

  private wake(): void {
    this.entity.components.forEach((component) => {
      component.wake()
    })
  }

  private pause(): void {
    this.entity.components.forEach((component) => {
      component.pause()
    })
  }

  private resume(): void {
    this.entity.components.forEach((component) => {
      component.resume()
    })
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
    this.unregisterListeners()
    this.entity.components.forEach((component) => {
      component.destroy()
    })
  }
}
