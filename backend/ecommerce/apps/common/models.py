"""
Modelos base abstractos para el proyecto eCommerce.
Proporciona funcionalidades comunes como timestamps y soft delete.
"""

from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

User = get_user_model()


class BaseModel(models.Model):
    """
    Modelo base abstracto que proporciona timestamps automáticos.
    """
    created_at = models.DateTimeField(
        _('created at'),
        auto_now_add=True,
        help_text=_('Fecha y hora de creación')
    )
    updated_at = models.DateTimeField(
        _('updated at'),
        auto_now=True,
        help_text=_('Fecha y hora de última actualización')
    )
    
    class Meta:
        abstract = True
        ordering = ['-created_at']


class SoftDeleteModel(BaseModel):
    """
    Modelo base abstracto que proporciona soft delete.
    Los objetos no se eliminan físicamente, se marcan como eliminados.
    """
    is_deleted = models.BooleanField(
        _('is deleted'),
        default=False,
        help_text=_('Indica si el objeto ha sido eliminado lógicamente')
    )
    deleted_at = models.DateTimeField(
        _('deleted at'),
        null=True,
        blank=True,
        help_text=_('Fecha y hora de eliminación lógica')
    )
    deleted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deleted_%(class)s_set',
        verbose_name=_('deleted by'),
        help_text=_('Usuario que eliminó el objeto')
    )
    
    class Meta:
        abstract = True
    
    def delete(self, using=None, keep_parents=False, deleted_by=None):
        """
        Soft delete del objeto.
        """
        self.is_deleted = True
        self.deleted_at = timezone.now()
        if deleted_by:
            self.deleted_by = deleted_by
        self.save(using=using)
    
    def hard_delete(self, using=None, keep_parents=False):
        """
        Eliminación física del objeto.
        """
        super().delete(using=using, keep_parents=keep_parents)
    
    def restore(self):
        """
        Restaura un objeto eliminado lógicamente.
        """
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.save()


class AuditModel(SoftDeleteModel):
    """
    Modelo base abstracto que proporciona auditoría completa.
    Incluye timestamps, soft delete y tracking de cambios.
    """
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_%(class)s_set',
        verbose_name=_('created by'),
        help_text=_('Usuario que creó el objeto')
    )
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_%(class)s_set',
        verbose_name=_('updated by'),
        help_text=_('Usuario que actualizó el objeto')
    )
    
    class Meta:
        abstract = True
    
    def save(self, *args, **kwargs):
        """
        Sobrescribe save para actualizar updated_by automáticamente.
        """
        # Si es una actualización, actualizar updated_by
        if self.pk and 'updated_by' in kwargs:
            self.updated_by = kwargs.pop('updated_by')
        super().save(*args, **kwargs)


class TimestampedModel(BaseModel):
    """
    Alias para BaseModel para compatibilidad.
    """
    pass


# gettext_lazy ya importado arriba
