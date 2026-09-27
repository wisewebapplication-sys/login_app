# Cómo generar el APK e instalarlo en el celular

Esta app web (`index.html` + `styles.css` + `script.js`) está envuelta con
[Capacitor](https://capacitorjs.com/) en un proyecto Android nativo, dentro de
la carpeta `android/`. Los archivos web no se suben al repo dentro de `android/`
(se generan), así que **antes de compilar corré una vez**:

```bash
npm install
npm run build:android   # copia la web a www/ y la vuelca al proyecto android/
```

> Nota: el `.apk` no se puede compilar en el entorno de Claude en la nube porque
> ahí está bloqueado el acceso a `dl.google.com` (de donde se descargan el SDK de
> Android y el plugin de Gradle). Se compila en tu compu, que sí tiene internet.

## Opción A — Android Studio (la más fácil, recomendada)

1. Instalá [Android Studio](https://developer.android.com/studio) (trae el SDK).
2. Abrí Android Studio → **Open** → elegí la carpeta `android/` de este repo.
3. Esperá a que termine el "Gradle Sync" (baja dependencias la primera vez).
4. Menú **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
5. Cuando termina, hacé clic en **locate** para encontrar el archivo:
   `android/app/build/outputs/apk/debug/app-debug.apk`

## Opción B — Por línea de comandos

Necesitás el SDK de Android instalado y la variable `ANDROID_HOME` apuntando a él.

```bash
cd android
./gradlew assembleDebug        # en Windows: gradlew.bat assembleDebug
```

El APK queda en: `android/app/build/outputs/apk/debug/app-debug.apk`

## Instalar el APK en el celular

1. Pasá el archivo `app-debug.apk` al teléfono (cable USB, Drive, etc.).
2. En el celular, activá **"Instalar apps de origen desconocido"** para el
   explorador de archivos o el navegador que uses.
3. Tocá el `.apk` y confirmá la instalación.

> Alternativa aún más rápida para probar: con el celular conectado por USB y la
> **depuración USB** activada, en Android Studio apretá el botón **Run ▶** y la
> app se instala y abre sola en el teléfono.

## Si cambiás el contenido web

Editá `index.html` / `styles.css` / `script.js` y volvé a sincronizar:

```bash
npm install          # solo la primera vez
npm run build:android   # copia la web a www/ y la vuelca al proyecto android/
```

Luego volvé a compilar con la Opción A o B.

## Datos del proyecto

- ID de la app: `com.tp.loginapp`  (editable en `capacitor.config.json`)
- Nombre: `Login App`
- Los íconos de Font Awesome están incluidos localmente en `vendor/fontawesome/`,
  así que la app funciona sin conexión a internet.
