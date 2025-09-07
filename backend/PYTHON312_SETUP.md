# Configuración para Python 3.12+

Este proyecto ha sido actualizado para ser compatible con Python 3.12+. Sigue estos pasos para configurar el entorno correctamente.

## 🚀 Instalación Rápida

### Opción 1: Script Automático
```bash
cd backend
python install_dependencies.py
```

### Opción 2: Instalación Manual
```bash
cd backend

# 1. Actualizar pip y setuptools
pip install --upgrade pip setuptools wheel

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Ejecutar migraciones
python manage.py migrate

# 4. Iniciar servidor
python manage.py runserver
```

## 🔧 Solución de Problemas

### Error: "No module named 'pkg_resources'"
Este error es común en Python 3.12+. El proyecto incluye compatibilidad automática, pero si persiste:

```bash
pip install --upgrade setuptools
pip install pkg_resources
```

### Error: "ModuleNotFoundError"
Asegúrate de que todas las dependencias estén instaladas:

```bash
pip install -r requirements.txt --force-reinstall
```

### Error de Versiones
Si hay conflictos de versiones:

```bash
pip install -r requirements.txt --upgrade
```

## 📋 Dependencias Principales

- **Django**: >=4.2.7,<5.0
- **Django REST Framework**: >=3.14.0
- **djangorestframework-simplejwt**: >=5.3.0
- **setuptools**: >=65.0.0 (requerido para Python 3.12+)

## 🐍 Compatibilidad

- ✅ Python 3.8+
- ✅ Python 3.9
- ✅ Python 3.10
- ✅ Python 3.11
- ✅ Python 3.12+
- ✅ Python 3.13+

## 🔍 Verificación

Para verificar que todo funciona correctamente:

```bash
python manage.py check
python manage.py runserver
```

Si ves el mensaje "Watching for file changes with StatReloader", ¡todo está funcionando correctamente!
