# Wesen

A lightweight, TypeScript-based component system for Phaser games, inspired by Unity's GameObject-Component pattern. Wesen provides a structured way to organize game logic using entities and components, making your Phaser games more maintainable and modular.

## Features

- 🎮 Unity-style component system for Phaser
- 🔄 Lifecycle management (init, create, update, destroy)
- 🎯 Type-safe component references
- 📦 Component dependency management
- 🔊 Event system integration
- ⚡ Priority-based component execution order

## Installation

```bash
npm install wesen
```

## Core Concepts

### Entity

An Entity represents a game object in your Phaser scene. It manages components and their lifecycle, automatically handling updates and cleanup.

```typescript
// Create an entity in your Phaser scene
const entity = new Entity(this)
```

### Components

Components are reusable pieces of functionality that can be attached to entities. Each component has a defined lifecycle:

- `init()`: Called immediately when added to an entity
- `create()`: Called on the first update after addition
- `update(time, delta)`: Called every frame
- `destroy()`: Called when the entity is destroyed

```typescript
class PlayerComponent extends Component {
  init(speed: number) {
    // Initialize component with parameters
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

## API Reference

### Entity

```typescript
class Entity {
  constructor(scene: Phaser.Scene)
  destroy(): void
  components: ComponentSystem
  events: Phaser.Events.EventEmitter
}
```

### ComponentSystem

```typescript
class ComponentSystem {
  // Adding/Removing Components
  add<T extends Component>(Component: ComponentConstructor<T>, ...args: Parameters<T['init']>): T
  remove<T extends Component>(Component: ComponentConstructor<T>): void
  clear(): void

  // Querying Components
  get<T extends Component>(Component: ComponentConstructor<T>): T
  find<T extends Component>(Component: ComponentConstructor<T>): T | undefined
  has<T extends Component>(Component: ComponentConstructor<T>): boolean
  all(): Component[]

  // Events
  events: Phaser.Events.EventEmitter
  // Emits: 'add', 'remove', 'update'
}
```

### Component

```typescript
abstract class Component {
  entity: Entity

  // Lifecycle Methods
  init(...args: any[]): void
  create(): void
  update(time: number, delta: number): void
  destroy(): void

  // Utility Methods
  protected listen<T extends Phaser.Events.EventEmitter>(obj: T, ...args: Parameters<T['on']>): void
}
```

## Usage Example

```typescript
// Base transform component that provides positioning
class TransformComponent extends Component {
  public transform!: Phaser.GameObjects.Container

  public init(x: number, y: number): void {
    this.transform = this.entity.scene.add.container(x, y)
  }

  public destroy(): void {
    this.transform.destroy()
  }
}

// Sprite component that uses the transform
@component({ required: [TransformComponent] })
class SpriteComponent extends Component {
  private sprite!: Phaser.GameObjects.Sprite
  private transform!: TransformComponent

  init(texture: string) {
    // Only initialize our own sprite
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

// Movement component that moves the transform
@component({ required: [TransformComponent] })
class MovementComponent extends Component {
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

// Input component that controls movement, priority is -1 to ensure it runs
// before the movement component
@component({ required: [MovementComponent], priority: -1 })
class PlayerInputComponent extends Component {
  private movement!: MovementComponent
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private moveDirection = new Phaser.Math.Vector2()

  init() {
    // Initialize our own resources
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

// Use in your Phaser scene
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    const player = new Entity(this)

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

## Component Metadata

Wesen supports TypeScript decorators for defining component metadata.

- Priority: Control the execution order of components
- Required Components: Specify dependencies on other components

To use decorators, you need to enable them in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

### Available Decorators

#### @component

A class decorator that allows you to define component metadata:

```typescript
import { component } from 'wesen'

// Set execution priority (lower numbers execute first)
@component({ priority: -1 })
class EarlyUpdateComponent extends Component {
  // ...
}

// Define required components
@component({
  required: [TransformComponent, SpriteComponent]
})
class AnimationComponent extends Component {
  // Component will only be added if TransformComponent and SpriteComponent exist
  // Will throw an error if requirements are not met
}

// Combine both
@component({
  priority: 1,
  required: [PhysicsComponent]
})
class LateUpdateComponent extends Component {
  // ...
}
```

### Priority System

Components are updated in priority order, where:

- Lower numbers execute first
- Default priority is 0
- Priorities can be negative

Example use cases:

```typescript
@component({ priority: -10 })
class InputComponent extends Component {
  // Processes input first
}

@component({ priority: 0 })
class PhysicsComponent extends Component {
  // Updates physics based on input
}

@component({ priority: 10 })
class CameraComponent extends Component {
  // Updates camera position after physics
}
```

### Component Dependencies

The `required` metadata ensures dependencies are met:

```typescript
@component({
  required: [TransformComponent]
})
class SpriteComponent extends Component {
  create() {
    // If there's no TransformComponent, this will throw an error
    const transform = this.entity.components.get(TransformComponent)
  }
}
```

## License

MIT
