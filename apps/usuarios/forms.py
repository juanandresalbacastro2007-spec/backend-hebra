from django import forms
from allauth.socialaccount.forms import SignupForm as BaseSocialSignupForm


class SocialSignupForm(BaseSocialSignupForm):
    """
    Formulario de registro cuando alguien entra por primera vez con Google.
    Pide nombre/apellido (por si Google no los trae completos) y una
    contraseña propia, para que la persona también pueda loguear después
    con el sistema manual (login_view) además de con Google.
    """
    nombre = forms.CharField(max_length=100, label='Nombre')
    apellido = forms.CharField(max_length=100, label='Apellido')
    contrasena = forms.CharField(
        widget=forms.PasswordInput,
        label='Contraseña',
        min_length=8,
        help_text='La vas a poder usar para iniciar sesión sin Google también.'
    )
    confirmar_contrasena = forms.CharField(
        widget=forms.PasswordInput,
        label='Confirmar contraseña'
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.widget.attrs.update({'class': 'form-control'})

    def clean(self):
        cleaned_data = super().clean()
        contrasena = cleaned_data.get('contrasena')
        confirmar = cleaned_data.get('confirmar_contrasena')

        if contrasena and confirmar and contrasena != confirmar:
            self.add_error('confirmar_contrasena', 'Las contraseñas no coinciden.')

        return cleaned_data