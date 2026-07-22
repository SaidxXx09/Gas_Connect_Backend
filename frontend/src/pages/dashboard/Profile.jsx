import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiCamera, FiLock, FiSave, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import useAuthStore from '../../context/storeAuth';

const Profile = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearToken = useAuthStore((state) => state.clearToken);
  const [tab, setTab] = useState('profile');
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const passwordForm = useForm();
  useEffect(() => { if (user) reset({ nombre: user.nombre, telefono: user.telefono, direccion: user.direccion }); }, [user, reset]);

  const saveProfile = async (values) => {
    try { const { data } = await api.put('/auth/profile', values); setUser(data.user); toast.success(data.mensaje); }
    catch (error) { toast.error(error.response?.data?.mensaje || 'No se pudo guardar'); }
  };
  const changePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) return toast.error('Las contraseñas no coinciden');
    try { const { data } = await api.put('/auth/profile/password', { currentPassword: values.currentPassword, newPassword: values.newPassword }); toast.success(data.mensaje); passwordForm.reset(); }
    catch (error) { toast.error(error.response?.data?.mensaje || 'No se pudo cambiar la contraseña'); }
  };
  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    const form = new FormData(); form.append('avatar', file); setUploading(true);
    try { const { data } = await api.put('/auth/profile/avatar', form); setUser({ ...user, avatar: data.avatar }); toast.success(data.mensaje); }
    catch (error) { toast.error(error.response?.data?.mensaje || 'No se pudo subir la imagen'); }
    finally { setUploading(false); }
  };
  const deactivate = async () => {
    if (!window.confirm('Tu cuenta quedará desactivada y cerrarás sesión. ¿Continuar?')) return;
    try { await api.delete('/auth/profile'); clearToken(); navigate('/login'); }
    catch (error) { toast.error(error.response?.data?.mensaje || 'No se pudo desactivar'); }
  };

  return (
    <><header className="page-heading"><div><h2>Mi perfil</h2><p>Administra tus datos, fotografía, contraseña y seguridad de la cuenta.</p></div></header><div className="profile-grid">
      <aside className="gc-card profile-summary"><div className="profile-photo">{user?.avatar?.url ? <img src={user.avatar.url} alt="Foto de perfil" /> : user?.nombre?.[0] || 'G'}</div><h3>{user?.nombre}</h3><p>{user?.email}</p><p><strong style={{ textTransform: 'capitalize' }}>{user?.role}</strong></p><p>{user?.emailConfirmed ? '✅ Correo confirmado' : '⚠️ Correo pendiente'}</p><label className="gc-button gc-button--secondary" style={{ marginTop: 14 }}><FiCamera /> {uploading ? 'Subiendo...' : 'Cambiar foto'}<input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} /></label></aside>
      <section className="gc-card"><div className="tabs"><button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>Datos personales</button><button className={tab === 'password' ? 'active' : ''} onClick={() => setTab('password')}>Contraseña</button></div>
        {tab === 'profile' ? <form className="gc-form" onSubmit={handleSubmit(saveProfile)}><div className="form-field"><label>Nombre completo</label><input {...register('nombre', { required: true, minLength: 3 })} /></div><div className="form-row"><div className="form-field"><label>Teléfono</label><input inputMode="numeric" {...register('telefono', { pattern: /^\d{10}$/ })} /></div><div className="form-field"><label>Rol</label><input value={user?.role || ''} readOnly /></div></div><div className="form-field"><label>Dirección</label><textarea {...register('direccion')} /></div><button className="gc-button gc-button--primary" disabled={isSubmitting}><FiSave /> Guardar cambios</button></form> : <form className="gc-form" onSubmit={passwordForm.handleSubmit(changePassword)}><div className="form-field"><label>Contraseña actual</label><input type="password" {...passwordForm.register('currentPassword', { required: true })} /></div><div className="form-row"><div className="form-field"><label>Nueva contraseña</label><input type="password" {...passwordForm.register('newPassword', { required: true, minLength: 6 })} /></div><div className="form-field"><label>Confirmar</label><input type="password" {...passwordForm.register('confirmPassword', { required: true })} /></div></div><button className="gc-button gc-button--primary"><FiLock /> Actualizar contraseña</button></form>}
        <hr style={{ border: 0, borderTop: '1px solid var(--gc-line)', margin: '25px 0' }} /><button className="gc-button gc-button--danger" onClick={deactivate}><FiTrash2 /> Desactivar mi cuenta</button>
      </section>
    </div></>
  );
};
export default Profile;
