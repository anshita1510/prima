# Design Document

## Overview

This design addresses the authentication issues between the frontend and backend where login works in Postman but fails in the browser. The root causes are CORS misconfiguration, missing environment variables, and response format inconsistencies.

## Architecture

The authentication flow involves:
1. Frontend login form submission
2. HTTP request to backend `/api/users/login` endpoint
3. Backend authentication processing
4. JSON response with user data and token
5. Frontend token storage and dashboard redirection

## Components and Interfaces

### Backend Components

**CORS Configuration (`Backend/src/config/cors.ts`)**
- Configure proper origin from CLIENT_URL environment variable
- Enable credentials support
- Handle preflight requests

**Environment Configuration (`Backend/.env`)**
- Add CLIENT_URL variable for frontend origin
- Ensure proper CORS origin configuration

**Login Controller Response Format**
- Maintain existing `{user, token}` format from LoginUsecase
- Ensure consistent JSON responses for both success and error cases

### Frontend Components

**Authentication Service (`Frontend/app/services/auth.services.ts`)**
- Handle the correct response format `{user, token}` from backend
- Maintain existing token storage logic
- Improve error handling for network issues

**Login Page (`Frontend/app/(auth)/login/page.tsx`)**
- Use correct API endpoint URL
- Handle response format properly
- Improve error display for debugging

## Data Models

**Login Request**
```typescript
{
  email: string;
  password: string;
}
```

**Login Response (Success)**
```typescript
{
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    status: Status;
    // ... other user fields
  };
  token: string;
}
```

**Login Response (Error)**
```typescript
{
  error: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After reviewing the prework analysis, I identified several properties that can be consolidated:
- Properties 1.2 and 3.3 both test CORS headers - can be combined
- Properties 2.1 and 2.3 both test response format completeness - can be combined  
- Properties 1.5 and 2.2 both test frontend response handling - can be combined
- Properties 1.3 and 2.4 both test error response format - can be combined

### Correctness Properties

**Property 1: Authentication flow success**
*For any* valid user credentials, submitting them through the frontend login form should result in successful authentication and appropriate dashboard redirection
**Validates: Requirements 1.1**

**Property 2: CORS headers and JSON response**
*For any* login request from the frontend, the backend should return a valid JSON response with proper CORS headers allowing the frontend origin
**Validates: Requirements 1.2, 3.3**

**Property 3: Error response format**
*For any* invalid credentials, the system should return a proper JSON error response instead of HTML
**Validates: Requirements 1.3, 2.4**

**Property 4: CORS configuration**
*For any* cross-origin request from the configured frontend origin, the backend should allow the request with proper CORS headers
**Validates: Requirements 1.4, 3.2, 3.4**

**Property 5: Frontend response handling**
*For any* successful login response in format `{user: object, token: string}`, the frontend should correctly extract and store both user data and authentication token
**Validates: Requirements 1.5, 2.2**

**Property 6: Backend response format**
*For any* successful authentication, the backend should return a response containing both user object and token string in the format `{user: object, token: string}`
**Validates: Requirements 2.1, 2.3**

## Error Handling

**CORS Errors**
- Missing CLIENT_URL environment variable
- Incorrect origin configuration
- Missing credentials support

**Response Format Errors**
- HTML error pages instead of JSON
- Inconsistent response structure
- Missing required fields

**Network Errors**
- Connection timeouts
- Server unavailability
- Invalid endpoints

## Testing Strategy

**Unit Tests**
- Test CORS configuration with different origins
- Test response format validation
- Test error response structures
- Test environment variable loading

**Property-Based Tests**
- Test authentication flow with various valid credentials
- Test CORS headers across different request types
- Test response format consistency
- Test error handling with various invalid inputs

**Integration Tests**
- Test complete frontend-to-backend authentication flow
- Test cross-origin request handling
- Test token storage and retrieval

Each property test will run a minimum of 100 iterations to ensure comprehensive coverage. Tests will be tagged with format: **Feature: auth-frontend-backend-fix, Property {number}: {property_text}**