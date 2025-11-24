# Keep ML Kit classes
-keep class com.google.mlkit.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.mlkit.**
-dontwarn com.google.android.gms.**

# Keep Firebase/MLKit native libs (حل UnsatisfiedLinkError، از web:3)
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Keep Kotlin metadata
-keep class kotlin.Metadata { *; }

# Keep CameraX / VisionCamera classes
-keep class androidx.camera.** { *; }
-keep class androidx.camera.core.** { *; }
-keep class androidx.camera.lifecycle.** { *; }
-dontwarn androidx.camera.**

# Keep anything referenced from native libs / reflection
-keep class com.google.gson.** { *; }
-keep class com.google.protobuf.** { *; }

# Keep for Worklets-Core (حل tracing conflict، از web:0, web:2, web:5)
-keep class com.worklets.** { *; }
-dontwarn com.worklets.**

# Keep for mgcrea / MLKit barcode (حل UnsatisfiedLinkError، از web:19, web:21, web:22, web:30)
-keep class com.mgcrea.visioncameracodescanner.** { *; }
-dontwarn com.mgcrea.visioncameracodescanner.**