# Controllers

## Responsabilities

Controllers are the entry points for handling HTTP requests. They interpret client requests, delegate tasks to appropriate use cases, and formulate responses. Utilizing Inversify decorators, controllers receive their dependencies via DI, ensuring clean and maintainable code.

:::warning
IMPORTANT: To use a controller, make sure you bind them in `ControllersInversify.ts`. If you don't, they won't be accessible.
:::

### SignUpController

```typescript
import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { DTOValidatorMiddleware } from "@providers/middlewares/DTOValidatorMiddleware";
import { HttpStatus, IUser } from "@startup-engine/shared";
import rateLimit from "express-rate-limit";
import { controller, httpPost, interfaces, request, requestBody, response } from "inversify-express-utils";
import { AuthSignUpDTO } from "../AuthDTO";
import { SignUpUseCase } from "./SignUpUseCase";

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limits this IP to only allow the creation of 10 accounts per minute
});

@controller("/auth")
export class SignUpController implements interfaces.Controller {
  constructor(private signupUseCase: SignUpUseCase, private analyticsHelper: AnalyticsHelper) {}

  @httpPost("/signup", rateLimiter, DTOValidatorMiddleware(AuthSignUpDTO))
  public async signUp(@requestBody() authSignUpDTO, @request() req, @response() res): Promise<IUser> {
    const newUser = await this.signupUseCase.signUp(authSignUpDTO);

    await this.analyticsHelper.updateUserInfo(newUser);

    return res.status(HttpStatus.Created).send(newUser);
  }
}
```

**Responsibilities:**

- **Route Handling**: Listens to `POST /auth/signup` requests.
- **Middlewares**:
  - **Rate Limiter**: Prevents abuse by limiting signup attempts.
  - **DTOValidatorMiddleware**: Validates incoming data against `AuthSignUpDTO`.
- **Business Logic Delegation**: Utilizes `SignUpUseCase` to handle the signup process.
- **Analytics Tracking**: Uses `AnalyticsHelper` to log user registration events.
- **Response Management**: Sends back the created user with a `201 Created` status.

## Data Transfer Objects (DTOs)

DTOs define the structure of data exchanged between the client and server, ensuring consistency and enabling validation. They play a crucial role in maintaining data integrity and simplifying data manipulation.

In practice, we use DTOs to:

- Validate incoming data from requests (class-validator).
- Define the structure of the data that our API will return.
- Define the structure of the data that our API will accept in requests.

### UserDTO.ts

```typescript
import { UserExperience, UserGoal } from "@startup-engine/shared/dist";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { tsDefaultDecorator, tsEnumDecorator } from "../../../providers/constants/ValidationConstants";

export class UserUpdateDTO {
  @IsOptional()
  @IsString(tsDefaultDecorator("validation", "isType", { type: "string" }))
  name: string;

  @IsOptional()
  @IsString(tsDefaultDecorator("validation", "isType", { type: "string" }))
  email: string;

  @IsOptional()
  @IsString(tsDefaultDecorator("validation", "isType", { type: "string" }))
  address: string;

  @IsOptional()
  @IsString(tsDefaultDecorator("validation", "isType", { type: "string" }))
  phone: string;

  @IsOptional()
  @IsString(tsDefaultDecorator("validation", "isType", { type: "string" }))
  pushNotificationToken: string;
}
```

**Key Features:**

- **Validation Decorators**: Ensures that each field adheres to specified types and constraints.
- **Optional Fields**: Facilitates partial updates by allowing certain fields to be omitted.

## Middlewares

Middlewares are functions that execute during the request-response cycle, handling tasks such as authentication, validation, logging, and more. They operate before the request reaches the controller, ensuring that requests meet necessary criteria.

For example, note how we use the DTOValidatorMiddleware to validate the incoming data from requests, in our `SignUpController`.

## Interaction Flow

Understanding the interplay between controllers, DTOs, middlewares, and dependency injection is essential for grasping the application's behavior. Here's a step-by-step breakdown of how a typical request flows through the system. You can check the `SignUpController` full flow diagram [here](./examples.md).

1. **Incoming Request**: A client sends an HTTP request to an endpoint, such as `POST /auth/signup`.

2. **Dependency Injection Setup**:

   - **Inversify** manages the creation and injection of dependencies.
   - Controllers like `SignUpController` receive their dependencies (`SignUpUseCase`, `AnalyticsHelper`) through Inversify's `ControllersInversify.ts`.

3. **Middleware Execution**:

   - **Rate Limiter**: Checks if the request rate exceeds predefined limits to prevent abuse.
   - **DTOValidatorMiddleware**: Validates the request body against the defined `AuthSignUpDTO`. If validation fails, the request is rejected with appropriate error messages.

4. **Controller Handling**:

   - **SignUpController** receives the validated DTO.
   - Invokes `SignUpUseCase` to process the signup logic, which typically involves creating a new user in the database via `UserRepository`.
   - Utilizes `AnalyticsHelper` to log user registration events for monitoring and analysis.

5. **Authentication Flow** (for Protected Routes):

   - **AuthMiddleware** intercepts incoming requests to validate JWT tokens.
   - If the token is valid, `AuthMiddleware` retrieves the user from the database and attaches user information to the request object (`req.user`), making it accessible to downstream handlers.
   - If the token is invalid or missing, an `UnauthorizedError` is thrown, and the request is denied.

6. **Response Formation**:

   - After successful processing, the controller sends back a response to the client. For instance, after a successful signup, the new user's data is returned with a `201 Created` status.

7. **Error Handling**:
   - Any errors encountered during the process (e.g., validation failures, authentication errors) are propagated through the middleware chain and handled gracefully, ensuring that clients receive meaningful error messages.

## Summary

Our application's architecture is meticulously crafted to promote scalability, maintainability, and robustness. By leveraging **Inversify** for dependency injection, **DTOs** for structured data handling, and **middlewares** for cross-cutting concerns like authentication and validation, we ensure a clean separation of concerns and adherence to best practices in TypeScript development. Controllers act as orchestrators, efficiently managing incoming requests and coordinating with use cases and helpers to deliver seamless functionality to our users.
