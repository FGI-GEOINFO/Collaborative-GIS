from .base import *  # noqa

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = ************* # Replace value

ALLOWED_HOSTS = ["*"]

CSRF_TRUSTED_ORIGINS = ['https://<DomainName>'] # Replace <DomainName> with actual domain
# SESSION_ENGINE = 'django.contrib.sessions.backends.signed_cookies'
# SESSION_COOKIE_HTTPONLY = True
# CSRF_COOKIE_HTTPONLY = False
# SESSION_COOKIE_SECURE = True
# CSRF_COOKIE_SECURE = True
# SECURE_SSL_REDIRECT = True
# SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO","https")

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

WAGTAIL_CACHE = False

try:
    from .local import *  # noqa
except ImportError:
    pass
