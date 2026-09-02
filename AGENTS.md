# Project Persistent Instructions

## Flutter Dependency Rules
- In all `pubspec.yaml` files throughout the project (`shared_core`, `user_app`, `merchant_app`, `admin_app`, or any other Flutter package), the `intl` dependency version **MUST ALWAYS** be:
  ```yaml
  intl: ^0.20.3
  ```
- **NEVER** generate or revert `intl` to `^0.19.0` or any older version.
