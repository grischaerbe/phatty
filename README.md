![Phatty](./phatty-dark.png#gh-dark-mode-only 'Phatty')
![Phatty](./phatty-light.png#gh-light-mode-only 'Phatty')

A lightweight, TypeScript-based entity component system for [Phaser
games](https://phaser.io/), inspired by Unity's
[GameObjects](https://docs.unity3d.com/Manual/GameObjects.html). Phatty provides
a structured way to organize game logic using entities and components, making
your Phaser games more maintainable and modular.

## Features

- 🎮 Unity-style component system for Phaser
- 🔄 Lifecycle management (create, update, destroy, …)
- 🎯 Type-safe component references
- 📦 Component dependency management
- 🔊 Event system integration
- ⚡ Priority-based component execution order

## Installation

```bash
npm install phatty
```

## Quick Start

See this StackBlitz for a full example:

<a href="https://stackblitz.com/edit/phatty-example?file=src%2Fmain.ts">
  <img src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" alt="Open in StackBlitz" />
</a>

### Creating a Scene

To use Phatty, you need to extend the `Scene` class. It's a regular Phaser
scene, but with an `EntitySystem` instance.

```ts
import { Scene } from 'phatty'

// Create an entity in your Phaser scene
class GameScene extends Scene {
  create() {
    const player = this.entities.create()
  }
}
```

### Creating an Entity

Entities are created by calling `this.entities.create()`. They follow the same
lifecycle as the scene, and are automatically destroyed when the scene is
destroyed.

```ts
const player = this.entities.create()
```

### Creating a Component

Components are created by extending the `Component` class. They are the building
blocks of what makes up an entity. They can have parameters, and can reference
and even require other components.

```ts
class PlayerComponent extends Component {
  constructor(public speed: number) {
    super()
  }

  create() {
    // Set up component and get references to other components
    const sprite = this.entity.components.get(SpriteComponent)
  }

  update(time: number, delta: number) {
    // Update logic
  }

  destroy() {
    // Cleanup
  }
}
```

### Adding Components

```ts
// Add a component to the player entity, with parameters
player.components.add(PlayerComponent, 100)
```

### Destroying an Entity

```ts
// Destroy the player entity
player.destroy()
```

---

## Documentation

1. [Core Concepts](#core-concepts)
   - [Scene](#scene)
   - [Entity](#entity)
   - [Component](#component)
     - [Component Lifecycle](#component-lifecycle)
     - [Component Priority](#component-priority)
     - [Component Dependencies](#component-dependencies)
1. [API Reference](#api-reference)
   - [Entity](#entity)
   - [ComponentSystem](#componentsystem)
   - [Component](#component)
1. [Example](#example)
1. [License](#license)

## Core Concepts

### Scene

A Phatty scene is a regular Phaser scene, but with an `EntitySystem` instance
which allows you to create, manage and query entities.

```ts
import { Scene } from 'phatty'

class GameScene extends Scene {
  create() {
    const player = this.entities.create()
  }
}
```

### Entity

An Entity represents a game object in your scene. It manages components
and their lifecycle.

```ts
// Create an entity in your Phaser scene
const entity = this.entities.create()
```

### Component

Components are the building blocks of what makes up an entity. They can have
parameters, and can reference and even require other components.

#### Component Lifecycle

A component offers life cycle functions that are called at the appropriate times
in the entity's lifecycle.

```ts
class PlayerComponent extends Component {
  constructor(public speed: number) {
    super()
    // The constructor is called immediately when the component is added
    // to an entity via `entity.components.add(PlayerComponent, 100)`.
    // You have access to the entity that the component is added to
    // via `this.entity`. You can also access the scene that the entity
    // belongs to via `this.entity.scene`. Typically, you'll want to set
    // up any entirely internal state in the constructor.
  }

  create() {
    // Set up component and get references to other components. This is
    // called on the first update after the component is added but before
    // the first update loop.
    const sprite = this.entity.components.get(SpriteComponent)
  }

  update(time: number, delta: number) {
    // Update logic. This is called every frame as long as the component
    // is not sleeping, not paused, and not destroyed.
  }

  sleep() {
    // This is called when the scene this component is attached to is put to
    // sleep.
  }

  wake() {
    // This is called when the scene this component is attached to is woken up
    // from sleep.
  }

  pause() {
    // This is called when the scene this component is attached to is paused.
  }

  resume() {
    // This is called when the scene this component is attached to is resumed.
  }

  destroy() {
    // This is called when the component is destroyed because
    // - The scene it belongs to is destroyed or shut down or
    // - The entity it belongs to is destroyed with `entity.destroy()`
  }
}
```

#### Component Priority

Components are updated in priority order, where:

- Lower numbers execute first
- Default priority is 0
- Priorities can be negative

```ts
class InputComponent extends Component {
  public priority = -10
  // Processes input first
}

class PhysicsComponent extends Component {
  public priority = 0
  // Updates physics based on input
}

class CameraComponent extends Component {
  public priority = 10
  // Updates camera position after physics
}
```

#### Component Dependencies

The `required` metadata ensures component dependencies are met:

```ts
class SpriteComponent extends Component {
  required: [TransformComponent]

  create() {
    // If there's no TransformComponent, this will throw an error
    const transform = this.entity.components.get(TransformComponent)
  }
}
```

## API Reference

### `Scene`

```ts
class Scene extends Phaser.Scene {
  entities: EntitySystem
}
```

### `EntitySystem`

```ts
type EntityQueryOptions = {
  with?: ComponentConstructor[] | ComponentConstructor
  without?: ComponentConstructor[] | ComponentConstructor
}

class EntitySystem {
  // Events: 'create', 'destroy'
  events: Phaser.Events.EventEmitter
  create(): Entity
  find(options: EntityQueryOptions): Entity | undefined
  findAll(options: EntityQueryOptions): Entity[]
}
```

### `Entity`

```ts
class Entity {
  constructor(scene: Phaser.Scene)
  components: ComponentSystem
  destroy(): void
}
```

### `ComponentSystem`

```ts
class ComponentSystem {
  // Adding/Removing Components
  add<T extends ComponentConstructor>(
    Component: T,
    ...args: ConstructorParameters<T>
  ): InstanceType<T>
  remove<T extends Component>(Component: ComponentConstructor<T>): void
  clear(): void

  // Querying Components
  get<T extends Component>(Component: ComponentConstructor<T>): T
  find<T extends Component>(Component: ComponentConstructor<T>): T | undefined
  has<T extends Component>(Component: ComponentConstructor<T>): boolean
  all(): Component[]

  // Events: 'add', 'remove', 'update'
  events: Phaser.Events.EventEmitter
}
```

### `Component`

```ts
abstract class Component {
  // Overrideable properties
  priority: number // Default: 0
  required: (typeof Component)[] // Default: []

  // Properties
  entity: Entity
  entities: EntitySystem
  scene: Scene

  // Lifecycle Methods
  create(): void
  update(time: number, delta: number): void
  sleep(): void
  wake(): void
  pause(): void
  resume(): void
  destroy(): void
}
```

## Example

Base transform component that provides positioning

```ts
class TransformComponent extends Component {
  public transform: Phaser.GameObjects.Container

  constructor(x: number, y: number) {
    super()
    this.transform = this.entity.scene.add.container(x, y)
  }

  public destroy(): void {
    this.transform.destroy()
  }
}
```

Sprite component that uses the transform

```ts
class SpriteComponent extends Component {
  required: [TransformComponent]
  private sprite: Phaser.GameObjects.Sprite
  private transform!: TransformComponent

  constructor(texture: string) {
    super()
    this.sprite = this.entity.scene.add.sprite(0, 0, texture).setOrigin(0.5, 0.5)
  }

  create() {
    // Get references to other components in create
    this.transform = this.entity.components.get(TransformComponent)
    this.transform.transform.add(this.sprite)
  }

  destroy() {
    this.sprite.destroy()
  }
}
```

Movement component that moves the transform

```ts
class MovementComponent extends Component {
  required: [TransformComponent]
  private transform!: TransformComponent
  private speed = 200
  private direction = new Phaser.Math.Vector2()

  create() {
    this.transform = this.entity.components.get(TransformComponent)
  }

  public update(_time: number, delta: number): void {
    if (this.direction.equals(Phaser.Math.Vector2.ZERO)) return
    const normalizedDir = this.direction.normalize()
    this.transform.transform.x += normalizedDir.x * this.speed * (delta / 1000)
    this.transform.transform.y += normalizedDir.y * this.speed * (delta / 1000)
    this.direction.set(0, 0)
  }

  move(direction: Phaser.Math.Vector2) {
    this.direction.copy(direction)
  }
}
```

Input component that controls movement, priority is -1 to ensure it runs before
the movement component

```ts
class PlayerInputComponent extends Component {
  required: [MovementComponent]
  priority: -1
  private movement!: MovementComponent
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private moveDirection: Phaser.Math.Vector2

  constructor() {
    super()
    this.cursors = this.entity.scene.input.keyboard!.createCursorKeys()
    this.moveDirection = new Phaser.Math.Vector2()
  }

  create() {
    // Get references to other components
    this.movement = this.entity.components.get(MovementComponent)
  }

  update() {
    // Reset movement vector
    this.moveDirection.set(0, 0)

    // Update based on input
    if (this.cursors.left.isDown) this.moveDirection.x -= 1
    if (this.cursors.right.isDown) this.moveDirection.x += 1
    if (this.cursors.up.isDown) this.moveDirection.y -= 1
    if (this.cursors.down.isDown) this.moveDirection.y += 1

    // Apply movement if there's input
    if (!this.moveDirection.equals(Phaser.Math.Vector2.ZERO)) {
      this.movement.move(this.moveDirection)
    }
  }
}
```

Use in your scene

```ts
import { Scene } from 'phatty'

class GameScene extends Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    const player = this.entities.create()

    player.components.add(TransformComponent, 400, 300)
    player.components.add(SpriteComponent, 'player')
    player.components.add(MovementComponent)
    player.components.add(PlayerInputComponent)
  }
}
```

This example demonstrates:

- Component communication through references
- Clear separation of concerns:
  - `SpriteComponent`: Handles rendering
  - `MovementComponent`: Handles movement logic
  - `PlayerInputComponent`: Handles input and controls movement
- Proper use of the component lifecycle
- Type-safe component references

The components work together while maintaining loose coupling, making it easy to:

- Replace input with AI by creating a new component
- Modify movement behavior without touching input logic
- Reuse components across different entities

## License

MIT
