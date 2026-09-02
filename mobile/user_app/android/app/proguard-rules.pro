# Flutter Proguard Rules
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Google Maps Proguard Rules
-keep class com.google.android.gms.maps.** { *; }
-keep interface com.google.android.gms.maps.** { *; }

# Flutter Secure Storage
-keep class com.it_nomads.fluttersecurestorage.** { *; }

# Prevent Obfuscation of Data Transfer Models
-keep class com.daleel.aykhidma.** { *; }

# Preserve Line Numbers for Crash Reporting / Sentry / Crashlytics Stacktraces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
