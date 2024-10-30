# Database Interaction

## Pre requisites

First of all, you'll need to have your docker containers running and a database properly configure in your .env. For example, you can use [firebase](../databases/available-databases/firebase.md), [mongodb](../databases/available-databases/robo3t.md) or [postgresql](../databases/available-databases/postgreSQL.md).

## Repository Pattern

Our database interaction follows a Repository Pattern, providing a clean and consistent way to handle data operations. This guide will show you how to implement database operations in your code.

:::info

Repository Pattern is a design pattern that provides a clean and consistent way to handle data operations. It separates the concerns of data access from business logic, promoting a more maintainable and scalable codebase. For example, it allows you to easily switch between different database providers without changing the business logic (a.k.a refactoring your whole project).

:::

## Basic Structure

The database interaction is built on three main components:

1. **Base Repository** - Provides common CRUD operations
2. **Custom Repository** - Extends base repository with specific business logic
3. **Service/Provider Layer** - Uses repositories to handle business operations

## Creating a Repository

Here's how to create a repository for a new entity:

```typescript
import { BaseRepository, IBaseRepository } from "@providers/database/repository/BaseRepository";
import { RepositoryFactory } from "@providers/database/repository/RepositoryFactory";
import { provide } from "inversify-binding-decorators";

@provide(YourRepository)
export class YourRepository extends BaseRepository<YourInterface> implements IBaseRepository<YourInterface> {
  constructor(private repositoryFactory: RepositoryFactory, private yourModel: YourModel) {
    super(repositoryFactory.createRepository<YourInterface>(yourModel.initializeData(yourSchema), yourSchema));
  }

  // Add custom methods here
}
```

:::tip

Check an example on `UserRepository`. This illustrates pretty well how to create a new repository.

:::

## Schemas

Schemas are the blueprints of our database entities. They define the structure of the data and the constraints that apply to it.

Our schemas are centralized in our `@startup-shared` folder because they export interfaces that are used in multiple projects (API, Client, etc). If you want to create a new schema, please add it to this lib, and then [make sure you republish and reinstall it on the target project](../../shared/getting-started.md).

## Available Database Operations

### Default Operations

Every repository automatically includes these operations:

```typescript
// Find by ID
const item = await this.someRepository.findById(id);

// Find one by criteria
const item = await this.someRepository.findBy({ field: value });

// Find many by criteria
const items = await this.someRepository.findManyBy({ field: value });

// Create
const newItem = await this.someRepository.create(data);

// Update by ID
await this.someRepository.updateById(id, updateData);

// Delete by ID
await this.someRepository.deleteById(id);

// Check if exists
const exists = await this.someRepository.exists({ field: value });
```

### Custom Operations

You can add custom operations in your repository. For example, from `UserRepository`:

```typescript
public async signUp(newUserData: IUser): Promise<IUser> {
  const newUser = await this.create(newUserData, {
    uniqueByKeys: "email",
  });

  return newUser;
}
```

## Using Repositories in Services

To actually interact with your database, you'll need to inject your repository into your service/provider. For example:

```typescript
@provide(YourService)
export class YourService {
  constructor(private yourRepository: YourRepository) {}

  public async someOperation(): Promise<void> {
    // Use repository methods here
    const item = await this.yourRepository.findBy({ field: "value" });
  }
}
```

## Best Practices

1. **Dependency Injection**: Always use constructor injection for repositories
2. **Type Safety**: Define proper interfaces for your entities
3. **Single Responsibility**: Keep repository methods focused on data operations
4. **Error Handling**: Let the repository handle database-specific errors
5. **Validation**: Implement data validation at the repository level when needed

## Example Implementation

Here's a complete example of how the pattern works:

```typescript
// Repository
@provide(ProductRepository)
export class ProductRepository extends BaseRepository<IProduct> {
  constructor(private repositoryFactory: RepositoryFactory, private productModel: ProductModel) {
    super(repositoryFactory.createRepository<IProduct>(productModel.initializeData(productSchema), productSchema));
  }

  public async findActiveProducts(): Promise<IProduct[]> {
    return this.findManyBy({ status: "active" });
  }
}

// Service
@provide(ProductService)
export class ProductService {
  constructor(private productRepository: ProductRepository) {}

  public async getActiveProducts(): Promise<IProduct[]> {
    return this.productRepository.findActiveProducts();
  }
}
```

## Advanced Features

### Unique Constraints

When creating items, you can specify unique constraints:

```typescript
await repository.create(data, {
  uniqueByKeys: "email" // Single key
  // or
  uniqueByKeys: ["email", "username"] // Multiple keys
});
```

### Complex Queries

For more complex queries, use the findManyBy method with multiple conditions:

```typescript
const items = await repository.findManyBy({
  status: "active",
  type: "premium",
  createdAt: { $gt: new Date("2023-01-01") },
});
```

This pattern provides a clean, maintainable, and type-safe way to interact with your database while keeping business logic separate from data access concerns.
