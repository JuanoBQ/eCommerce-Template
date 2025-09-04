"use client"

import { useState } from 'react'
import { Users, Search, Filter, MoreVertical, Trash2, Eye, Shield, UserCheck, UserX, X, Save, UserPlus } from 'lucide-react'
import { useUsers, User, CreateUserData } from '@/hooks/useUsers'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const { 
    users, 
    userStats, 
    isLoading, 
    error, 
    deleteUser, 
    toggleUserStatus, 
    toggleUserRole,
    createUser
  } = useUsers()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  
  // Estados para modales
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Estados para formularios
  const [createForm, setCreateForm] = useState<CreateUserData>({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_staff: false,
    is_active: true
  })

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active)
    const matchesRole = roleFilter === 'all' || 
                       (roleFilter === 'staff' && user.is_staff) ||
                       (roleFilter === 'regular' && !user.is_staff)
    
    return matchesSearch && matchesStatus && matchesRole
  }) || []

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${userName}?`)) {
      try {
        await deleteUser(userId)
      } catch (error) {
        console.error('Error al eliminar usuario:', error)
      }
    }
  }

  const handleToggleStatus = async (userId: number, currentStatus: boolean, userName: string) => {
    const action = currentStatus ? 'desactivar' : 'activar'
    if (confirm(`¿Estás seguro de que quieres ${action} al usuario ${userName}?`)) {
      try {
        await toggleUserStatus(userId, !currentStatus)
      } catch (error) {
        console.error('Error al cambiar estado del usuario:', error)
      }
    }
  }

  const handleToggleRole = async (userId: number, currentRole: boolean, userName: string) => {
    const action = currentRole ? 'quitar permisos de administrador' : 'dar permisos de administrador'
    if (confirm(`¿Estás seguro de que quieres ${action} al usuario ${userName}?`)) {
      try {
        await toggleUserRole(userId, !currentRole)
      } catch (error) {
        console.error('Error al cambiar rol del usuario:', error)
      }
    }
  }

  // Funciones para manejar modales
  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setViewModalOpen(true)
  }

  const handleCreateUser = () => {
    setCreateForm({
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      is_staff: false,
      is_active: true
    })
    setCreateModalOpen(true)
  }



  const handleSaveCreate = async () => {
    try {
      await createUser(createForm)
      setCreateModalOpen(false)
      setCreateForm({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        is_staff: false,
        is_active: true
      })
    } catch (error) {
      console.error('Error al crear usuario:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error al cargar usuarios: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-neon-green text-dark-900 rounded-lg hover:bg-neon-green/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Usuarios</h1>
          <p className="text-dark-400 mt-2">Gestiona los usuarios del sistema</p>
        </div>
        <button 
          onClick={handleCreateUser}
          className="px-4 py-2 bg-neon-green text-dark-900 font-medium rounded-lg hover:bg-neon-green/90 transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Stats */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Total Usuarios</p>
                <p className="text-2xl font-bold text-white">{userStats.total_users}</p>
              </div>
              <Users className="w-8 h-8 text-neon-green" />
            </div>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Administradores</p>
                <p className="text-2xl font-bold text-white">{userStats.staff_users}</p>
              </div>
              <Shield className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Clientes</p>
                <p className="text-2xl font-bold text-white">{userStats.regular_users}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm">Usuarios Activos</p>
                <p className="text-2xl font-bold text-white">{userStats.active_users}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
            />
          </div>
          
          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
              aria-label="Filtrar por estado"
            >
              <option value="all">Todos los Estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
              aria-label="Filtrar por rol"
            >
              <option value="all">Todos los Roles</option>
              <option value="staff">Administradores</option>
              <option value="regular">Clientes</option>
            </select>
          </div>
          
          {/* Clear Filters Button */}
          {(statusFilter !== 'all' || roleFilter !== 'all') && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setStatusFilter('all')
                  setRoleFilter('all')
                }}
                className="px-4 py-2 text-sm text-dark-400 hover:text-white transition-colors"
              >
                Limpiar filtros
          </button>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Usuario</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Rol</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Último Acceso</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-dark-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-neon-green rounded-full flex items-center justify-center">
                        <span className="text-dark-900 font-semibold">
                          {user.first_name[0]}{user.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-dark-400 text-sm">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_staff 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.is_staff ? 'Administrador' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_active 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-dark-400">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Nunca'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="p-2 text-dark-400 hover:text-white transition-colors" 
                        title="Ver"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.is_active, `${user.first_name} ${user.last_name}`)}
                        className={`p-2 transition-colors ${
                          user.is_active 
                            ? 'text-dark-400 hover:text-yellow-400' 
                            : 'text-dark-400 hover:text-green-400'
                        }`}
                        title={user.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleToggleRole(user.id, user.is_staff, `${user.first_name} ${user.last_name}`)}
                        className="p-2 text-dark-400 hover:text-purple-400 transition-colors"
                        title={user.is_staff ? 'Quitar permisos de admin' : 'Dar permisos de admin'}
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                        className="p-2 text-dark-400 hover:text-red-400 transition-colors" 
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>



      {/* Modal Ver Usuario */}
      {viewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Detalles del Usuario</h3>
              <button 
                onClick={() => setViewModalOpen(false)}
                className="p-2 text-dark-400 hover:text-white transition-colors"
                title="Cerrar modal"
                aria-label="Cerrar modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Información Básica */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-neon-green rounded-full flex items-center justify-center">
                  <span className="text-dark-900 font-semibold text-xl">
                    {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                  </span>
                </div>
                <div>
                  <h4 className="text-white font-medium text-xl">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h4>
                  <p className="text-dark-400">ID: {selectedUser.id}</p>
                  <p className="text-dark-400">Email: {selectedUser.email}</p>
                </div>
              </div>
              
              {/* Información Personal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-white border-b border-dark-600 pb-2">Información Personal</h5>
                  
                  <div>
                    <label className="text-dark-400 text-sm">Username</label>
                    <p className="text-white">{selectedUser.username || 'No especificado'}</p>
                  </div>
                  
                  <div>
                    <label className="text-dark-400 text-sm">Teléfono</label>
                    <p className="text-white">{selectedUser.phone || 'No especificado'}</p>
                  </div>
                  
                  <div>
                    <label className="text-dark-400 text-sm">Fecha de Nacimiento</label>
                    <p className="text-white">
                      {selectedUser.birth_date ? new Date(selectedUser.birth_date).toLocaleDateString() : 'No especificada'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-dark-400 text-sm">Avatar</label>
                    <p className="text-white">{selectedUser.avatar ? 'Tiene avatar' : 'Sin avatar'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-white border-b border-dark-600 pb-2">Estado y Permisos</h5>
                  
                  <div>
                    <label className="text-dark-400 text-sm">Rol</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.is_staff 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {selectedUser.is_staff ? 'Administrador' : 'Cliente'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="text-dark-400 text-sm">Superusuario</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.is_superuser 
                        ? 'bg-yellow-500/20 text-yellow-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {selectedUser.is_superuser ? 'Sí' : 'No'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="text-dark-400 text-sm">Estado</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.is_active 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {selectedUser.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="text-dark-400 text-sm">Es Vendedor</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.is_vendor 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {selectedUser.is_vendor ? 'Sí' : 'No'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="text-dark-400 text-sm">Es Cliente</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.is_customer 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {selectedUser.is_customer ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Direcciones del Usuario */}
              <div className="space-y-4">
                <h5 className="text-lg font-semibold text-white border-b border-dark-600 pb-2">
                  Direcciones ({selectedUser.addresses?.length || 0})
                </h5>
                
                {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                  <div className="space-y-4">
                    {selectedUser.addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`border rounded-lg p-4 ${
                          address.is_default 
                            ? 'border-neon-green bg-neon-green/5' 
                            : 'border-dark-600 bg-dark-700/30'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h6 className="text-white font-medium">{address.title}</h6>
                            {address.is_default && (
                              <span className="px-2 py-1 bg-neon-green text-dark-900 text-xs font-medium rounded-full">
                                Predeterminada
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {address.is_shipping && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                                Envío
                              </span>
                            )}
                            {address.is_billing && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                Facturación
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-300 space-y-1">
                          <p className="font-medium">{address.first_name} {address.last_name}</p>
                          <p>{address.address_line_1}</p>
                          {address.address_line_2 && <p>{address.address_line_2}</p>}
                          <p>{address.city}, {address.state} {address.postal_code}</p>
                          <p>{address.country}</p>
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-400">
                          <p>Dirección completa: {address.full_address}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No hay direcciones registradas</p>
                  </div>
                )}
              </div>
              
              {/* Configuración de Notificaciones */}
              <div className="space-y-4">
                <h5 className="text-lg font-semibold text-white border-b border-dark-600 pb-2">Configuración de Notificaciones</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-dark-400 text-sm">Notificaciones por Email</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.email_notifications 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {selectedUser.email_notifications ? 'Activadas' : 'Desactivadas'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="text-dark-400 text-sm">Notificaciones por SMS</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.sms_notifications 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {selectedUser.sms_notifications ? 'Activadas' : 'Desactivadas'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Información de Cuenta */}
              <div className="space-y-4">
                <h5 className="text-lg font-semibold text-white border-b border-dark-600 pb-2">Información de Cuenta</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-dark-400 text-sm">Fecha de Registro</label>
                    <p className="text-white">
                      {new Date(selectedUser.date_joined).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-dark-400 text-sm">Último Acceso</label>
                    <p className="text-white">
                      {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Nunca'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-dark-400 text-sm">Fecha de Creación</label>
                    <p className="text-white">
                      {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'No disponible'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-dark-400 text-sm">Última Actualización</label>
                    <p className="text-white">
                      {selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'No disponible'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-dark-400 text-sm">Términos Aceptados</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.terms_accepted 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedUser.terms_accepted ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Modal Crear Usuario */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Crear Nuevo Usuario</h3>
              <button 
                onClick={() => setCreateModalOpen(false)}
                className="p-2 text-dark-400 hover:text-white transition-colors"
                title="Cerrar modal"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-dark-400 text-sm mb-2">Email *</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                  aria-label="Email del nuevo usuario"
                  required
                />
              </div>
              
              <div>
                <label className="block text-dark-400 text-sm mb-2">Nombre *</label>
                <input
                  type="text"
                  value={createForm.first_name}
                  onChange={(e) => setCreateForm({...createForm, first_name: e.target.value})}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                  aria-label="Nombre del nuevo usuario"
                  required
                />
              </div>
              
              <div>
                <label className="block text-dark-400 text-sm mb-2">Apellido *</label>
                <input
                  type="text"
                  value={createForm.last_name}
                  onChange={(e) => setCreateForm({...createForm, last_name: e.target.value})}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                  aria-label="Apellido del nuevo usuario"
                  required
                />
              </div>
              
              <div>
                <label className="block text-dark-400 text-sm mb-2">Contraseña *</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
                  aria-label="Contraseña del nuevo usuario"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={createForm.is_staff}
                    onChange={(e) => setCreateForm({...createForm, is_staff: e.target.checked})}
                    className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                  />
                  <span className="text-white text-sm">Administrador</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={createForm.is_active}
                    onChange={(e) => setCreateForm({...createForm, is_active: e.target.checked})}
                    className="w-4 h-4 text-neon-green bg-dark-700 border-dark-600 rounded focus:ring-neon-green focus:ring-2"
                  />
                  <span className="text-white text-sm">Activo</span>
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSaveCreate}
                  className="flex-1 px-4 py-2 bg-neon-green text-dark-900 font-medium rounded-lg hover:bg-neon-green/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Crear Usuario
                </button>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-dark-700 text-white font-medium rounded-lg hover:bg-dark-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}
