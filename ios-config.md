# iOS Configuration Instructions

When you build for iOS, you need to add this to your Info.plist:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.739278720477-c6lvhnmtvs9ilg6ujsfrp6jhbps93a0h</string>
        </array>
    </dict>
</array>
```

This allows Google OAuth to redirect back to your app after authentication.