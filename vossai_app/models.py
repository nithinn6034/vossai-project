from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, name, email, password):
        if not email:
            raise ValueError('Email is required')
        if not name:
            raise ValueError('Name is required')
        if not password:
            raise ValueError('Password is required')
        user = self.model(name=name, email=self.normalize_email(email))
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, name, email, password):
        user = self.create_user(name=name, email=email, password=password)
        user.is_staff     = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    name      = models.CharField(max_length=100)
    email     = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff  = models.BooleanField(default=False)

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['name']
    objects = UserManager()

    def __str__(self):
        return self.name