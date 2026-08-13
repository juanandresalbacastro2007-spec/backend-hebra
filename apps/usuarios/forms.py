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

        # Tomamos nombre/apellido directo de Google y los ocultamos:
        # el usuario ya no tiene que tipearlos, solo crea su contraseña.
        extra_data = {}
        sociallogin = getattr(self, 'sociallogin', None)
        if sociallogin is not None:
            extra_data = sociallogin.account.extra_data or {}

        self.fields['nombre'].initial = extra_data.get('given_name', '')
        self.fields['nombre'].widget = forms.HiddenInput()
        self.fields['nombre'].required = False

        self.fields['apellido'].initial = extra_data.get('family_name', '')
        self.fields['apellido'].widget = forms.HiddenInput()
        self.fields['apellido'].required = False

        # allauth puede traer un campo 'username' obligatorio que no
        # mostramos en el template. Lo autogeneramos a partir del email
        # para que no bloquee el envío del formulario silenciosamente.
        if 'username' in self.fields:
            self.fields['username'].required = False
            self.fields['username'].widget = forms.HiddenInput()

        # El email también viene de Google, lo dejamos de solo lectura
        # (visible como referencia, no editable).
        if 'email' in self.fields:
            self.fields['email'].widget.attrs['readonly'] = True

        for field_name, field in self.fields.items():
            field.widget.attrs.update({'class': 'form-control'})

    def clean_nombre(self):
        nombre = self.cleaned_data.get('nombre')
        if nombre:
            return nombre
        sociallogin = getattr(self, 'sociallogin', None)
        if sociallogin is not None:
            extra_data = sociallogin.account.extra_data or {}
            return extra_data.get('given_name', '')
        return ''

    def clean_apellido(self):
        apellido = self.cleaned_data.get('apellido')
        if apellido:
            return apellido
        sociallogin = getattr(self, 'sociallogin', None)
        if sociallogin is not None:
            extra_data = sociallogin.account.extra_data or {}
            return extra_data.get('family_name', '')
        return ''

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if username:
            return username
        # Generamos uno a partir del email si vino vacío
        email = self.data.get('email') or getattr(self, 'sociallogin', None) and self.sociallogin.user.email
        base = (email or 'usuario').split('@')[0]
        return base

    def clean(self):
        cleaned_data = super().clean()
        contrasena = cleaned_data.get('contrasena')
        confirmar = cleaned_data.get('confirmar_contrasena')

        if contrasena and confirmar and contrasena != confirmar:
            self.add_error('confirmar_contrasena', 'Las contraseñas no coinciden.')

        return cleaned_data