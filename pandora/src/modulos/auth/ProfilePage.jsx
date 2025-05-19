import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { profileService } from './api/profileService';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { UserCircle, Mail, Phone, Building, Briefcase, Lock, Eye, EyeOff, Calendar, Clock, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from './authContext';

const ProfilePage = () => {
  const { toast } = useToast();
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Formulario para la información personal
  const {
    register: registerInfo,
    handleSubmit: handleSubmitInfo,
    formState: { errors: errorsInfo },
    reset: resetInfo,
  } = useForm();

  // Formulario para el cambio de contraseña
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
    reset: resetPassword,
    watch,
  } = useForm();

  // Efecto para cargar los datos del perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const data = await profileService.getProfile();
        
        // Cargar datos en el formulario
        resetInfo({
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone || '',
          position: data.position || '',
          department: data.department || '',
        });
        
        // Cargar imagen de perfil si existe
        if (data.profile_image) {
          setImagePreview(data.profile_image);
        }
        
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Error",
          description: error?.detail || "No se pudieron cargar los datos del perfil.",
        });
      }
    };

    loadProfile();
  }, [resetInfo, toast]);

  // Manejar cambio de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      
      // Crear URL para vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Enviar actualización de perfil
  const onSubmitInfo = async (data) => {
    try {
      setIsLoading(true);
      setUpdateSuccess(false);
      
      const profileData = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        position: data.position,
        department: data.department,
      };

      // Añadir imagen si ha cambiado
      if (profileImage) {
        profileData.profile_image = profileImage;
      }

      const updatedProfile = await profileService.updateProfile(profileData);
      
      // Actualizar datos en el contexto de autenticación
      setUser(prev => ({
        ...prev,
        firstName: updatedProfile.first_name,
        lastName: updatedProfile.last_name,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        position: updatedProfile.position,
        department: updatedProfile.department,
        profileImage: updatedProfile.profile_image
      }));

      // Mostrar mensaje de éxito
      setUpdateSuccess(true);
      
      // Timer para ocultar el mensaje después de 5 segundos
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 5000);

      toast({
        title: "Perfil actualizado",
        description: "Tu información personal ha sido actualizada correctamente.",
      });
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error al actualizar perfil:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.detail || "No se pudo actualizar el perfil.",
      });
    }
  };

  // Enviar cambio de contraseña
  const onSubmitPassword = async (data) => {
    try {
      setIsLoading(true);
      
      await profileService.changePassword({
        old_password: data.currentPassword,
        new_password: data.newPassword,
        new_password2: data.confirmPassword,
      });

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada correctamente.",
      });
      
      // Resetear formulario
      resetPassword();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error al cambiar contraseña:", error);
      
      if (error.old_password) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "La contraseña actual es incorrecta.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error?.detail || "No se pudo cambiar la contraseña.",
        });
      }
    }
  };

  // Formatear fecha para mejor visualización
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Toggle para mostrar/ocultar contraseña
  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Mi Perfil</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <span>Última actualización:</span>
          <Clock size={14} className="inline" />
          <span>{user?.dateJoined ? formatDate(user.dateJoined) : 'N/A'}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Panel lateral con información básica */}
        <div className="lg:col-span-4">
          <Card className="sticky top-24">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Perfil" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <UserCircle size={64} className="text-white" />
                      </div>
                    )}
                  </div>
                  <Label 
                    htmlFor="profileImage" 
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-indigo-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </Label>
                </div>
                <h2 className="text-2xl font-bold text-center mb-1">
                  {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Usuario'}
                </h2>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-4">
                  {user?.position || 'Sin cargo asignado'}
                </p>
                
                <div className="w-full border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{user?.email || 'No disponible'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{user?.phone || 'No disponible'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building size={16} className="text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{user?.department || 'No disponible'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">Miembro desde: {user?.dateJoined ? formatDate(user.dateJoined).split(',')[0] : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                {updateSuccess && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md flex items-center gap-2">
                    <Check size={16} className="shrink-0" />
                    <span>Perfil actualizado correctamente</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Área principal con tabs */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
              <TabsTrigger 
                value="info" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm rounded-md transition-all"
              >
                Información Personal
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm rounded-md transition-all"
              >
                Seguridad
              </TabsTrigger>
            </TabsList>
            
            {/* Pestaña de Información Personal */}
            <TabsContent value="info">
              <Card className="border-0 shadow-md rounded-xl">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-750 rounded-t-xl">
                  <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                    <UserCircle size={22} />
                    Información Personal
                  </CardTitle>
                  <CardDescription>
                    Actualiza tus datos personales y de contacto.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmitInfo(onSubmitInfo)}>
                  <CardContent className="space-y-6 pt-6">
                    {/* Información personal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium flex items-center gap-1">
                          <span>Nombre</span>
                          {errorsInfo.firstName && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                          id="firstName"
                          {...registerInfo('firstName', { required: "El nombre es requerido" })}
                          placeholder="Tu nombre"
                          className={`h-11 ${errorsInfo.firstName ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-indigo-500"}`}
                        />
                        {errorsInfo.firstName && (
                          <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                            <X size={14} />
                            {errorsInfo.firstName.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium flex items-center gap-1">
                          <span>Apellido</span>
                          {errorsInfo.lastName && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                          id="lastName"
                          {...registerInfo('lastName', { required: "El apellido es requerido" })}
                          placeholder="Tu apellido"
                          className={`h-11 ${errorsInfo.lastName ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-indigo-500"}`}
                        />
                        {errorsInfo.lastName && (
                          <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                            <X size={14} />
                            {errorsInfo.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1">
                        <Mail size={14} className="text-gray-500" />
                        <span>Correo electrónico</span>
                        {errorsInfo.email && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...registerInfo('email', { 
                          required: "El correo electrónico es requerido",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Correo electrónico inválido"
                          }
                        })}
                        placeholder="correo@ejemplo.com"
                        className={`h-11 ${errorsInfo.email ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-indigo-500"}`}
                      />
                      {errorsInfo.email && (
                        <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                          <X size={14} />
                          {errorsInfo.email.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1">
                        <Phone size={14} className="text-gray-500" />
                        <span>Teléfono</span>
                      </Label>
                      <Input
                        id="phone"
                        {...registerInfo('phone')}
                        placeholder="Tu número de teléfono"
                        className="h-11 focus-visible:ring-indigo-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="position" className="text-sm font-medium flex items-center gap-1">
                          <Briefcase size={14} className="text-gray-500" />
                          <span>Cargo</span>
                        </Label>
                        <Input
                          id="position"
                          {...registerInfo('position')}
                          placeholder="Tu cargo"
                          className="h-11 focus-visible:ring-indigo-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-sm font-medium flex items-center gap-1">
                          <Building size={14} className="text-gray-500" />
                          <span>Departamento</span>
                        </Label>
                        <Input
                          id="department"
                          {...registerInfo('department')}
                          placeholder="Tu departamento"
                          className="h-11 focus-visible:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t pt-6">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-6"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" /> 
                          Guardando...
                        </>
                      ) : (
                        "Guardar cambios"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            {/* Pestaña de Seguridad */}
            <TabsContent value="security">
              <Card className="border-0 shadow-md rounded-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-750 rounded-t-xl">
                  <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                    <Lock size={22} />
                    Seguridad de la cuenta
                  </CardTitle>
                  <CardDescription>
                    Actualiza tu contraseña para mantener segura tu cuenta.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-sm font-medium flex items-center gap-1">
                        <span>Contraseña actual</span>
                        {errorsPassword.currentPassword && <span className="text-red-500">*</span>}
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword.current ? "text" : "password"}
                          {...registerPassword('currentPassword', { 
                            required: "La contraseña actual es requerida" 
                          })}
                          className={`h-11 pr-10 ${errorsPassword.currentPassword ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-indigo-500"}`}
                        />
                        <button 
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errorsPassword.currentPassword && (
                        <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                          <X size={14} />
                          {errorsPassword.currentPassword.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium flex items-center gap-1">
                        <span>Nueva contraseña</span>
                        {errorsPassword.newPassword && <span className="text-red-500">*</span>}
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPassword.new ? "text" : "password"}
                          {...registerPassword('newPassword', { 
                            required: "La nueva contraseña es requerida",
                            minLength: {
                              value: 8,
                              message: "La contraseña debe tener al menos 8 caracteres"
                            }
                          })}
                          className={`h-11 pr-10 ${errorsPassword.newPassword ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-indigo-500"}`}
                        />
                        <button 
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errorsPassword.newPassword && (
                        <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                          <X size={14} />
                          {errorsPassword.newPassword.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-1">
                        <span>Confirmar contraseña</span>
                        {errorsPassword.confirmPassword && <span className="text-red-500">*</span>}
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPassword.confirm ? "text" : "password"}
                          {...registerPassword('confirmPassword', { 
                            required: "Debes confirmar la contraseña",
                            validate: value => 
                              value === watch('newPassword') || "Las contraseñas no coinciden"
                          })}
                          className={`h-11 pr-10 ${errorsPassword.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-indigo-500"}`}
                        />
                        <button 
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errorsPassword.confirmPassword && (
                        <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                          <X size={14} />
                          {errorsPassword.confirmPassword.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mt-4">
                      <h4 className="text-amber-800 dark:text-amber-300 font-medium flex items-center gap-2 text-sm mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        Recomendaciones de seguridad
                      </h4>
                      <ul className="text-amber-700 dark:text-amber-400 text-sm space-y-1 pl-6 list-disc">
                        <li>Utiliza una contraseña de al menos 8 caracteres</li>
                        <li>Combina letras mayúsculas, minúsculas, números y símbolos</li>
                        <li>Evita usar información personal o contraseñas comunes</li>
                        <li>No reutilices contraseñas de otros servicios</li>
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t pt-6">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-6"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" /> 
                          Cambiando contraseña...
                        </>
                      ) : (
                        "Cambiar contraseña"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;