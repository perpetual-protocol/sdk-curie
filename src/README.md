# Perp-SDK

Encapsulate most of business logic into this folder.

# Future Work

Pull this folder out as a npm package.

# Contribution Guideline

## Pattern

### Data

-   Always provide on-demand data fetching methods
-   Support realtime updates with `EventEmitter` when necessary
-   Never cache locally within SDK implementation to eliminate unexpected behavior caused by outdated data

### Error Handling

-   Always throw predefined error type; never try-catch so that errors are propagated for the SDK users to handle.

### Validator

-   To check values before sending transactions, always compare against on-demand fetched data instead of cached data to minimize the chance of comparing with outdated value.
