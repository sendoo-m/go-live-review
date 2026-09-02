# Flutter Proguard Rules
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Flutter Secure Storage
-keep class com.it_nomads.fluttersecurestorage.** { *; }

# Image Picker & File Picker
-keep class io.flutter.plugins.imagepicker.** { *; }

# Prevent Obfuscation of Data Models
-keep class com.daleel.aykhidma.** { *; }

# Preserve Line Numbers for Crash Reporting / Sentry / Crashlytics Stacktraces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
